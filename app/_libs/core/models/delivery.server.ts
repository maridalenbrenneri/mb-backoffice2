import { prisma } from '~/db.server';

import type { Delivery } from '@prisma/client';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';
export type { Delivery };
export type DeliveryUpsertInput = Pick<
  Delivery,
  'id' | 'date' | 'type' | 'coffee1Id' | 'coffee2Id' | 'coffee3Id' | 'coffee4Id'
>;

export async function getDeliveries(filter?: any) {
  filter = filter || {
    include: {
      coffee1: true,
      coffee2: true,
      coffee3: true,
      coffee4: true,
      orders: true,
    },
  };

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTE INPUT
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  return prisma.delivery.findMany(filter);
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
