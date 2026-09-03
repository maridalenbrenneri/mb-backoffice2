import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  UserEntity,
  ProductEntity,
  SubscriptionEntity,
  DeliveryEntity,
  OrderEntity,
  OrderItemEntity,
  JobResultEntity,
} from '~/services/entities';

// Fly private network is IPv6. Node 17+ defaults to ipv4first, which can hang
// connecting to *.flympg.net until TCP timeout.
// https://fly.io/docs/mpg/client-configuration/
// dns.setDefaultResultOrder('ipv6first');

// Keep the process alive when pg emits async pool errors.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

let _dataSource: DataSource | null = null;
let _initPromise: Promise<DataSource> | null = null;
let _resetPromise: Promise<void> | null = null;

function sslFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return false;
  try {
    const host = new URL(databaseUrl).hostname;
    if (host === 'localhost' || host === '127.0.0.1') return false;
  } catch {
    return false;
  }
  // MPG requires SSL. Node-pg will not enable TLS unless asked.
  return { rejectUnauthorized: false };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** pg.Pool connectionTimeoutMillis — the pool is busy, not necessarily dead. */
export function isPoolCheckoutTimeout(err: unknown): boolean {
  return /timeout exceeded when trying to connect/i.test(errorMessage(err));
}

export function isTransientDbError(err: unknown): boolean {
  if (isPoolCheckoutTimeout(err)) return false;
  return /connection terminated|ECONNRESET|ECONNREFUSED|EPIPE|server closed the connection|Connection terminated unexpectedly|cannot connect/i.test(
    errorMessage(err)
  );
}

function createDataSource() {
  return new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: sslFromDatabaseUrl(),
    entities: [
      UserEntity,
      ProductEntity,
      SubscriptionEntity,
      DeliveryEntity,
      OrderEntity,
      OrderItemEntity,
      JobResultEntity,
    ],
    synchronize: false,
    logging:
      process.env.TYPEORM_LOGGING === 'true'
        ? ['query', 'error', 'warn']
        : ['error', 'warn'],

    // Fly Managed Postgres — Node pg.Pool recommended settings
    // https://fly.io/docs/mpg/client-configuration/
    extra: {
      max: 5,
      idleTimeoutMillis: 300_000, // 5 min — close idle connections before proxy does
      maxLifetimeSeconds: 600, // 10 min — recycle before Fly proxy drain
      connectionTimeoutMillis: 10_000,
    },

    poolErrorHandler: (err) => {
      console.warn('[db] pool error', err);
    },
  });
}

export function getDataSource() {
  if (!_dataSource) {
    _dataSource = createDataSource();
  }
  return _dataSource;
}

export async function ensureDataSourceInitialized() {
  if (_resetPromise) {
    await _resetPromise;
  }

  const ds = getDataSource();
  if (ds.isInitialized) {
    return ds;
  }

  if (!_initPromise) {
    _initPromise = ds.initialize().then(
      () => ds,
      (err) => {
        _initPromise = null;
        _dataSource = null;
        throw err;
      }
    );
  }

  return _initPromise;
}

export async function closeDataSource() {
  if (_resetPromise) return _resetPromise;

  _resetPromise = (async () => {
    _initPromise = null;
    if (_dataSource?.isInitialized) {
      try {
        await _dataSource.destroy();
      } catch (err) {
        console.warn('[db] error while closing data source', err);
      }
    }
    _dataSource = null;
  })().finally(() => {
    _resetPromise = null;
  });

  return _resetPromise;
}

/**
 * Retry once on transient Fly/PgBouncer drops. Pool checkout timeouts retry
 * without destroying the pool — resetting on a busy pool causes a stampede.
 */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDataSourceInitialized();
  try {
    return await fn();
  } catch (err) {
    if (isPoolCheckoutTimeout(err)) {
      console.warn(
        '[db] pool checkout timeout, retrying once without reset',
        err
      );
      return await fn();
    }
    if (!isTransientDbError(err)) throw err;
    console.warn('[db] transient error, resetting pool and retrying once', err);
    await closeDataSource();
    await ensureDataSourceInitialized();
    return await fn();
  }
}

process.on('SIGINT', async () => {
  await closeDataSource();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDataSource();
  process.exit(0);
});
