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

let _dataSource: DataSource | null = null;
let _initPromise: Promise<DataSource> | null = null;
let _lastHealthyAt = 0;
let _resetPromise: Promise<void> | null = null;

const HEALTH_CHECK_INTERVAL_MS = 30_000;

function isTransientDbError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /connection terminated|connection timeout|timeout exceeded|ECONNRESET|ECONNREFUSED|Connection terminated|server closed the connection|cannot connect/i.test(
    message
  );
}

function createDataSource() {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  // Determine SSL behavior based on Fly.io topology
  // - Internal host ("*.internal") → no SSL (pgbouncer on 5432 typically has TLS disabled)
  // - Any external host → SSL (no cert verification)
  let sslOption: boolean | { rejectUnauthorized: false } = false;
  if (isProduction && databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      const hostname = parsed.hostname ?? '';
      const isInternal = hostname.endsWith('.internal');
      sslOption = isInternal ? false : { rejectUnauthorized: false };
    } catch {
      // If parsing fails, default to using SSL in production
      sslOption = { rejectUnauthorized: false };
    }
  }

  return new DataSource({
    type: 'postgres',
    url: databaseUrl,
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

    // pg.Pool options — tuned for Fly Managed Postgres / proxy idle drops
    // https://fly.io/docs/mpg/client-configuration/
    extra: {
      max: isProduction ? 5 : 10,
      // Allow idleTimeout to close every connection; don't keep a warm zombie around
      min: 0,
      connectionTimeoutMillis: 5_000,
      // Close idle clients quickly — Fly/proxy can silently drop longer-lived sockets
      idleTimeoutMillis: 20_000,
      // Recycle well before Fly's ~10 min proxy drain window
      maxLifetimeSeconds: 300,
      allowExitOnIdle: true,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      // Fail stuck queries server-side when the packet actually reaches Postgres
      options: '-c statement_timeout=30000',
    },

    ssl: sslOption,

    poolErrorHandler: (err) => {
      console.error('[db] pool error', err);
    },

    cache: {
      duration: 30000,
    },
  });
}

export function getDataSource() {
  if (!_dataSource) {
    _dataSource = createDataSource();
  }
  return _dataSource;
}

async function initializeDataSource() {
  if (_resetPromise) {
    await _resetPromise;
  }

  const ds = getDataSource();
  if (ds.isInitialized) {
    return ds;
  }

  if (!_initPromise) {
    _initPromise = ds.initialize().then(
      (initialized) => {
        const pool = (initialized.driver as { master?: { on?: Function } })
          .master;
        if (pool?.on) {
          pool.on('error', (err: Error) => {
            console.error('[db] idle client error, scheduling reset', err);
            void resetDataSource('idle client error');
          });
        }
        _lastHealthyAt = Date.now();
        return initialized;
      },
      (err) => {
        _initPromise = null;
        _dataSource = null;
        throw err;
      }
    );
  }

  return _initPromise;
}

export async function ensureDataSourceInitialized() {
  let ds = await initializeDataSource();

  const now = Date.now();
  if (now - _lastHealthyAt <= HEALTH_CHECK_INTERVAL_MS) {
    return ds;
  }

  try {
    await ds.query('SELECT 1');
    _lastHealthyAt = Date.now();
    return ds;
  } catch (err) {
    console.warn('[db] health check failed, resetting pool', err);
    await resetDataSource('health check failed');
    ds = await initializeDataSource();
    await ds.query('SELECT 1');
    _lastHealthyAt = Date.now();
    return ds;
  }
}

export async function resetDataSource(reason?: string) {
  if (_resetPromise) return _resetPromise;

  console.warn('[db] resetting data source', reason ?? '');
  _resetPromise = (async () => {
    _initPromise = null;
    _lastHealthyAt = 0;
    if (_dataSource?.isInitialized) {
      try {
        await _dataSource.destroy();
      } catch (err) {
        console.error('[db] error while destroying data source', err);
      }
    }
    _dataSource = null;
  })().finally(() => {
    _resetPromise = null;
  });

  return _resetPromise;
}

export async function closeDataSource() {
  await resetDataSource('close');
}

/** Retry once after resetting the pool when a connection-level error occurs. */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await ensureDataSourceInitialized();
    return await fn();
  } catch (err) {
    if (!isTransientDbError(err)) throw err;
    console.warn('[db] transient error, retrying once after reset', err);
    await resetDataSource('transient query error');
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
