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

export function getDataSource() {
  if (_dataSource && _dataSource.isInitialized) return _dataSource;

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

  _dataSource = new DataSource({
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
    logging: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],

    // Connection pool configuration
    extra: {
      // Connection pool settings
      max: isProduction ? 20 : 10, // Maximum number of connections in the pool
      min: isProduction ? 5 : 2, // Minimum number of connections in the pool
      idle: 10000, // Maximum time (ms) a connection can be idle
      acquire: 60000, // Maximum time (ms) to acquire a connection
      evict: 1000, // How often to run eviction checks (ms)

      // Connection timeout settings
      connectionTimeoutMillis: 10000, // Time to acquire connection
      idleTimeoutMillis: 30000, // Time connection can be idle
    },

    ssl: sslOption,

    // Additional TypeORM settings
    cache: {
      duration: 30000, // 30 seconds cache duration
    },
  });

  return _dataSource;
}

export async function ensureDataSourceInitialized() {
  const ds = getDataSource();
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}

// Graceful shutdown function
export async function closeDataSource() {
  if (_dataSource && _dataSource.isInitialized) {
    await _dataSource.destroy();
    _dataSource = null;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDataSource();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDataSource();
  process.exit(0);
});
