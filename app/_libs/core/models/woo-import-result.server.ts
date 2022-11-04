import { prisma } from '~/db.server';

import type { WooImportResult } from '@prisma/client';
export type { WooImportResult };

export async function getLastWooImportResult() {
  return prisma.wooImportResult.findMany({
    take: 1,
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });
}

export async function getWooImportResults() {
  return prisma.wooImportResult.findMany({
    take: 100,
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });
}

export async function createWooImportResult(
  result: Pick<WooImportResult, 'result'>
) {
  await prisma.wooImportResult.create({ data: result });
}
