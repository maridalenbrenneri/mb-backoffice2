import { prisma } from '~/db.server';

import type { ImportResult } from '@prisma/client';
export type { ImportResult };

export async function getLastImportResult(name: string) {
  return prisma.importResult.findMany({
    where: {
      name,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });
}

export async function getImportResults(name: string) {
  return prisma.importResult.findMany({
    where: {
      name,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
}

export async function createImportResult(
  result: Pick<ImportResult, 'name' | 'result' | 'errors' | 'importStartedAt'>
) {
  await prisma.importResult.create({
    data: result,
  });
}
