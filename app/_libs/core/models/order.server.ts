import { prisma } from '~/db.server';

import type { Order } from '@prisma/client';

export type { Order };
export type OrderUpsertData = Pick<
  Order,
  | 'id'
  | 'subscriptionId'
  | 'deliveryId'
  | 'name'
  | 'addressStreet1'
  | 'addressStreet2'
  | 'addressPostcode'
  | 'addressPlace'
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
      addressStreet1: order.addressStreet1,
      addressStreet2: order.addressStreet2,
      addressPostcode: order.addressPostcode,
      addressPlace: order.addressPlace,
      subscriptionId: order.subscriptionId,
      deliveryId: order.deliveryId,
    },
  });
}
