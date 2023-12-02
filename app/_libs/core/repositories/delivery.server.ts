import { prisma } from '~/db.server';

import type { Delivery } from '@prisma/client';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Delivery };
export type DeliveryUpsertData = Pick<
  Delivery,
  'date' | 'type' | 'product1Id' | 'product2Id' | 'product3Id' | 'product4Id'
>;

export async function getDeliveryById(id: number, include?: any) {
  return prisma.delivery.findUnique({
    where: { id },
    include,
  });
}

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
      product1Id: data.product1Id || null,
      product2Id: data.product2Id || null,
      product3Id: data.product3Id || null,
      product4Id: data.product4Id || null,
    },
  });
}
