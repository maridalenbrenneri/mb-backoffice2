import { getRepository } from '~/services/repository.utils';
import { JobResultEntity } from '~/services/entities';
import { JOB_RESULT_KEEP_PER_NAME } from '~/settings';

export type CreateJobResultInput = Pick<
  JobResultEntity,
  'name' | 'result' | 'errors' | 'jobStartedAt'
>;

async function getRepo() {
  return getRepository(JobResultEntity);
}

async function pruneOldJobResults(name: string) {
  const repo = await getRepo();
  await repo.query(
    `DELETE FROM "JobResult" WHERE id IN (
       SELECT id FROM (
         SELECT id FROM "JobResult"
         WHERE name = $1
         ORDER BY "createdAt" DESC, id DESC
         OFFSET $2
       ) AS old_rows
     )`,
    [name, JOB_RESULT_KEEP_PER_NAME]
  );
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
    await pruneOldJobResults(nameFilter);
  } else {
    const names = await repo
      .createQueryBuilder('jr')
      .select('jr.name', 'name')
      .distinct(true)
      .getRawMany();
    for (const row of names) {
      const name = row.name ?? row.jr_name;
      if (name) await pruneOldJobResults(name);
    }
  }

  return repo.find({
    where: whereCondition,
    order: { createdAt: 'desc' },
    take:
      nameFilter && nameFilter !== '_all'
        ? JOB_RESULT_KEEP_PER_NAME
        : JOB_RESULT_KEEP_PER_NAME * 10,
  });
}

export async function createJobResult(result: CreateJobResultInput) {
  const repo = await getRepo();
  const entity = repo.create(result);
  await repo.save(entity);
  await pruneOldJobResults(result.name);
}
