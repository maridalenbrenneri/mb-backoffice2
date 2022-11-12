import { prisma } from '~/db.server';

import type { Order } from '@prisma/client';
import { OrderType, OrderStatus } from '@prisma/client';

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

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      orderItems: true,
      delivery: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 30,
  });
}

export async function getOrder(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
      delivery: true,
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
