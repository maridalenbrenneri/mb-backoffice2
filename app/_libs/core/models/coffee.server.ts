import { prisma } from '~/db.server';

import type { Coffee } from '@prisma/client';
import { CoffeeStatus } from '@prisma/client';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Coffee };

export async function getCoffees(filter?: any) {
  filter = filter || {};

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTE INPUT
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  return prisma.coffee.findMany(filter);
}

export async function getActiveCoffees() {
  const filter = {
    where: { status: CoffeeStatus.ACTIVE },
    take: TAKE_DEFAULT_ROWS,
  };

  return prisma.coffee.findMany(filter);
}

export async function getCoffeeById(id: number) {
  return prisma.coffee.findUnique({ where: { id } });
}

export async function upsertCoffee(
  coffee: Pick<Coffee, 'id' | 'name' | 'productCode' | 'country' | 'status'>
) {
  return prisma.coffee.upsert({
    where: {
      id: coffee.id || 0,
    },
    update: coffee,
    create: {
      name: coffee.name,
      productCode: coffee.productCode,
      country: coffee.country,
      status: coffee.status,
    },
  });
}
