import { prisma } from '~/db.server';

import type { Delivery } from '@prisma/client';
export type { Delivery };
export type DeliveryUpsertInput = Pick<
  Delivery,
  'id' | 'date' | 'type' | 'coffee1Id' | 'coffee2Id' | 'coffee3Id' | 'coffee4Id'
>;

export async function getDeliveries() {
  return prisma.delivery.findMany({
    include: {
      coffee1: true,
      coffee2: true,
      coffee3: true,
      coffee4: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 10,
  });
}

export async function getDelivery(id: number) {
  return prisma.delivery.findUnique({
    where: { id },
    include: {
      coffee1: true,
      coffee2: true,
      coffee3: true,
      coffee4: true,
      orders: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

export async function upsertDelivery(input: DeliveryUpsertInput) {
  return prisma.delivery.upsert({
    where: {
      id: input.id || 0,
    },
    update: input,
    create: {
      date: input.date,
      type: input.type,
      coffee1Id: input.coffee1Id || null,
      coffee2Id: input.coffee2Id || null,
      coffee3Id: input.coffee3Id || null,
      coffee4Id: input.coffee4Id || null,
    },
  });
}
