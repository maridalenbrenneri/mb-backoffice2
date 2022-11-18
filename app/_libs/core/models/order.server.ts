import { prisma } from '~/db.server';

import type { Order } from '@prisma/client';
import { OrderType, OrderStatus } from '@prisma/client';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Order };
export type OrderUpsertData = Pick<
  Order,
  | 'id'
  | 'subscriptionId'
  | 'deliveryId'
  | 'name'
  | 'address1'
  | 'address2'
  | 'postalCode'
  | 'postalPlace'
  | 'email'
  | 'mobile'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
>;

export async function getOrders(filter?: any) {
  filter = filter || {
    include: {
      orderItems: true,
      delivery: true,
    },
  };

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTE INPUT
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  return prisma.order.findMany(filter);
}

export async function getOrder(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
      delivery: true,
      subscription: true,
    },
  });
}

export async function upsertOrder(input: OrderUpsertData) {
  return prisma.order.upsert({
    where: {
      id: input.id || 0,
    },
    update: input,
    create: {
      type: OrderType.RECURRING,
      status: OrderStatus.ACTIVE,
      name: input.name,
      address1: input.address1,
      address2: input.address2,
      postalCode: input.postalCode,
      postalPlace: input.postalPlace,
      email: input.email,
      mobile: input.mobile,
      subscriptionId: input.subscriptionId,
      deliveryId: input.deliveryId,
      quantity250: input.quantity250,
      quantity500: input.quantity500,
      quantity1200: input.quantity1200,
    },
  });
}
