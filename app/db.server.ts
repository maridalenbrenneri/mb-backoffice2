import { PrismaClient } from '@prisma/client';
import { DataSource } from 'typeorm';
import { DeliveryEntity } from './_services/delivery/delivery.entity';
import { OrderItemEntity } from './_services/order/order-item.entity';
import { OrderEntity } from './_services/order/order.entity';
import { SubscriptionEntity } from './_services/subscription/subscription-entity';
import { ProductEntity } from './_services/product/product.entity';
import { UserEntity } from './_services/user.entity';

let prisma: PrismaClient;
let dataSource: DataSource;

declare global {
  var __db__: PrismaClient;
  var __dataSource__: DataSource;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();

  initializeDataSource()
    .then((ds) => {
      dataSource = ds;
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
    });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  prisma.$connect();
  if (!global.__dataSource__) {
    initializeDataSource()
      .then((ds) => {
        global.__dataSource__ = ds;
        dataSource = ds;
      })
      .catch((err) => {
        console.error('Error during Data Source initialization:', err);
      });
  } else {
    dataSource = global.__dataSource__;
  }
}

async function initializeDataSource() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      DeliveryEntity,
      OrderItemEntity,
      OrderEntity,
      SubscriptionEntity,
      ProductEntity,
      UserEntity,
    ],
    //synchronize: process.env.NODE_ENV !== 'production',
    logging: true,
  });
  try {
    await ds.initialize();
    console.log('Data Source has been initialized!');
    return ds;
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    throw err;
  }
}

export { prisma, dataSource };
