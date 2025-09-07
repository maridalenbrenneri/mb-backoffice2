import { ensureDataSourceInitialized } from '~/typeorm/data-source';
import { JobResultEntity } from '~/services/entities';

export type CreateJobResultInput = Pick<
  JobResultEntity,
  'name' | 'result' | 'errors' | 'jobStartedAt'
>;

async function getRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(JobResultEntity);
}

export async function getLastJobResult(name: string) {
  const repo = await getRepo();
  return repo.find({
    where: { name },
    order: { createdAt: 'desc' },
    take: 1,
  });
}

export async function getJobResults(nameFilter?: string) {
  const repo = await getRepo();
  const whereCondition: any = {};

  if (nameFilter && nameFilter !== '_all') {
    whereCondition.name = nameFilter;
  }

  return repo.find({
    where: whereCondition,
    order: { createdAt: 'desc' },
    take: 500,
  });
}

export async function createJobResult(result: CreateJobResultInput) {
  const repo = await getRepo();
  const entity = repo.create(result);
  await repo.save(entity);
}
