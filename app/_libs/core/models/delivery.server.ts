import { prisma } from '~/db.server';

import type { Delivery } from '@prisma/client';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Delivery };
export type DeliveryUpsertData = Pick<
  Delivery,
  'date' | 'type' | 'coffee1Id' | 'coffee2Id' | 'coffee3Id' | 'coffee4Id'
>;

export async function getDeliveries(filter?: any) {
  filter = filter || {};

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!filter.orderBy) filter.orderBy = { date: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;

  //  filter.where = filter.where || {};
  // TODO: Always exclude DELETED

  return prisma.delivery.findMany(filter);
}

export async function getDelivery(filter: any) {
  if (!filter) return null;

  return await prisma.delivery.findFirst(filter);
}

export async function upsertDelivery(
  id: number | null,
  data: DeliveryUpsertData
) {
  return prisma.delivery.upsert({
    where: {
      id: id || 0,
    },
    update: data,
    create: {
      date: data.date,
      type: data.type,
      coffee1Id: data.coffee1Id || null,
      coffee2Id: data.coffee2Id || null,
      coffee3Id: data.coffee3Id || null,
      coffee4Id: data.coffee4Id || null,
    },
  });
}
