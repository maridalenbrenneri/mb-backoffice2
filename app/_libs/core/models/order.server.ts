import { prisma } from '~/db.server';

import type { Order, OrderItem } from '@prisma/client';
import { OrderType, OrderStatus } from '@prisma/client';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Order };
export type OrderUpsertInput = Pick<
  Order,
  | 'subscriptionId'
  | 'deliveryId'
  | 'type'
  | 'status'
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

export type OrderItemUpsertInput = Pick<
  OrderItem,
  'id' | 'orderId' | 'coffeeId' | 'variation' | 'quantity'
>;

export async function getOrders(filter?: any) {
  filter = filter || {
    include: {
      orderItems: true,
      delivery: true,
    },
  };

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
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

export async function upsertOrder(id: number | null, input: OrderUpsertInput) {
  return prisma.order.upsert({
    where: {
      id: id || 0,
    },
    update: input,
    create: {
      type: OrderType.RECURRING,
      status: OrderStatus.ACTIVE,
      subscriptionId: input.subscriptionId,
      deliveryId: input.deliveryId,
      name: input.name,
      address1: input.address1,
      address2: input.address2,
      postalCode: input.postalCode,
      postalPlace: input.postalPlace,
      email: input.email,
      mobile: input.mobile,
      quantity250: input.quantity250,
      quantity500: input.quantity500,
      quantity1200: input.quantity1200,
    },
  });
}

export async function upsertOrderItem(
  id: number | null,
  input: OrderItemUpsertInput
) {
  return prisma.orderItem.upsert({
    where: {
      id: id || 0,
    },
    update: input,
    create: {
      orderId: input.orderId,
      coffeeId: input.coffeeId,
      quantity: input.quantity,
      variation: input.variation,
    },
  });
}
