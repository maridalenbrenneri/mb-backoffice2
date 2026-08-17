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

    // pg.Pool options — Fly Managed Postgres
    // https://fly.io/docs/mpg/client-configuration/
    extra: {
      max: isProduction ? 5 : 10,
      min: 0,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      maxLifetimeSeconds: 300,
      allowExitOnIdle: true,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    },

    ssl: sslOption,

    // Required so idle client errors don't crash the Node process
    poolErrorHandler: (err) => {
      console.warn('[db] pool error', err);
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

export async function ensureDataSourceInitialized() {
  const ds = getDataSource();
  if (ds.isInitialized) {
    return ds;
  }

  if (!_initPromise) {
    _initPromise = ds.initialize().then(
      () => ds,
      (err) => {
        // Allow a later call to retry after a failed init
        _initPromise = null;
        _dataSource = null;
        throw err;
      }
    );
  }

  return _initPromise;
}

export async function closeDataSource() {
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
