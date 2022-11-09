import { prisma } from '~/db.server';

import type { Order } from '@prisma/client';

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
>;

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
}

export async function getOrder(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });
}

export async function upsertOrder(order: OrderUpsertData) {
  return prisma.order.upsert({
    where: {
      id: order.id || 0,
    },
    update: order,
    create: {
      name: order.name,
      address1: order.address1,
      address2: order.address2,
      postalCode: order.postalCode,
      postalPlace: order.postalPlace,
      subscriptionId: order.subscriptionId,
      deliveryId: order.deliveryId,
    },
  });
}
