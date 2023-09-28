import { prisma } from '~/db.server';

import type { JobResult } from '@prisma/client';
export type { JobResult };

export async function getLastJobResult(name: string) {
  return prisma.jobResult.findMany({
    where: {
      name,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });
}

export async function getJobResults() {
  return prisma.jobResult.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 300,
  });
}

export async function createJobResult(
  result: Pick<JobResult, 'name' | 'result' | 'errors' | 'jobStartedAt'>
) {
  await prisma.jobResult.create({
    data: result,
  });
}
