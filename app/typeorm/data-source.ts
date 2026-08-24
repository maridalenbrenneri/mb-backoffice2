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

// Fly private network is IPv6. Node 17+ defaults to ipv4first, which can hang
// connecting to *.flympg.net until TCP timeout.
// https://fly.io/docs/mpg/client-configuration/
dns.setDefaultResultOrder('ipv6first');

let _dataSource: DataSource | null = null;
let _initPromise: Promise<DataSource> | null = null;

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
  // rejectUnauthorized: false is the usual Fly/internal-CA setup.
  return { rejectUnauthorized: false };
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
      max: 10,
      idleTimeoutMillis: 300_000, // 5 min
      maxLifetimeSeconds: 600, // 10 min — recycle before Fly proxy drain
      connectionTimeoutMillis: 5_000,
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
