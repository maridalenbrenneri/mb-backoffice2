import dns from 'node:dns';
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

dns.setDefaultResultOrder('ipv6first');

let _dataSource: DataSource | null = null;
let _initPromise: Promise<DataSource> | null = null;
let _lastHealthCheckAt = 0;
const HEALTH_CHECK_INTERVAL_MS = 15_000;

function parseDatabaseUrl(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return { url: databaseUrl, ssl: false as const };
  }

  let hostname = '';
  let username: string | undefined;
  let password: string | undefined;
  let host: string | undefined;
  let port: number | undefined;
  let database: string | undefined;

  try {
    const parsed = new URL(databaseUrl);
    hostname = parsed.hostname ?? '';
    username = decodeURIComponent(parsed.username);
    password = decodeURIComponent(parsed.password);
    host = parsed.hostname;
    port = parsed.port ? Number(parsed.port) : 5432;
    database = parsed.pathname.replace(/^\//, '') || undefined;
  } catch {
    return {
      url: databaseUrl,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false as const }
          : false,
    };
  }

  const isInternal = hostname.endsWith('.internal');
  const useSsl =
    process.env.NODE_ENV === 'production' && !isInternal
      ? { rejectUnauthorized: false as const }
      : false;

  return {
    username,
    password,
    host,
    port,
    database,
    ssl: useSsl,
  };
}

function createDataSource() {
  const isProduction = process.env.NODE_ENV === 'production';
  const parsed = parseDatabaseUrl(process.env.DATABASE_URL);

  return new DataSource({
    type: 'postgres',
    // Prefer discrete fields so sslmode= in DATABASE_URL cannot disable SSL
    ...(parsed.host
      ? {
          host: parsed.host,
          port: parsed.port,
          username: parsed.username,
          password: parsed.password,
          database: parsed.database,
        }
      : { url: parsed.url }),
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

    // Exact pg.Pool settings from Fly MPG client docs
    // https://fly.io/docs/mpg/client-configuration/
    extra: {
      max: isProduction ? 5 : 10,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 300_000, // 5 min
      maxLifetimeSeconds: 600, // 10 min — recycle before proxy drain
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    },

    ssl: parsed.ssl,

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
  let ds = getDataSource();
  if (!ds.isInitialized) {
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
    ds = await _initPromise;
  }

  // Detect stale pool state periodically and recreate the DataSource on failure.
  const now = Date.now();
  if (now - _lastHealthCheckAt < HEALTH_CHECK_INTERVAL_MS) {
    return ds;
  }
  _lastHealthCheckAt = now;

  try {
    await ds.query('SELECT 1');
    return ds;
  } catch (err) {
    console.warn('[db] health check failed; recreating DataSource', err);
    await closeDataSource();
    ds = getDataSource();
    _initPromise = ds.initialize().then(
      () => ds,
      (err) => {
        _initPromise = null;
        _dataSource = null;
        throw err;
      }
    );
    ds = await _initPromise;
    await ds.query('SELECT 1');
    return ds;
  }
}

export async function closeDataSource() {
  _lastHealthCheckAt = 0;
  _initPromise = null;
  if (_dataSource?.isInitialized) {
    try {
      await _dataSource.destroy();
    } catch (err) {
      console.warn('[db] error while closing data source', err);
    }
  }
  _dataSource = null;
}

process.on('SIGINT', async () => {
  await closeDataSource();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDataSource();
  process.exit(0);
});
