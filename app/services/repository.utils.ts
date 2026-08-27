import { Repository, EntityTarget, ObjectLiteral, DataSource } from 'typeorm';
import {
  ensureDataSourceInitialized,
  withDbRetry,
  isTransientDbError,
  closeDataSource,
} from '~/typeorm/data-source';

const repositoryCache = new Map<
  EntityTarget<any>,
  { ds: DataSource; repo: Repository<any> }
>();

function wrapRepositoryWithRetry<T extends ObjectLiteral>(
  repo: Repository<T>
): Repository<T> {
  return new Proxy(repo, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;

      return (...args: unknown[]) => {
        const result = value.apply(target, args);
        if (!result || typeof (result as Promise<unknown>).then !== 'function') {
          return result;
        }

        return (result as Promise<unknown>).catch(async (err: unknown) => {
          if (!isTransientDbError(err)) throw err;

          console.warn(
            `[db] transient error on Repository.${String(prop)}, retrying once`,
            err
          );
          repositoryCache.clear();
          await closeDataSource();
          const ds = await ensureDataSourceInitialized();
          const fresh = ds.getRepository(target.target as EntityTarget<T>);
          repositoryCache.set(target.target, { ds, repo: fresh });
          return (fresh as any)[prop](...args);
        });
      };
    },
  });
}

/**
 * Get a repository for the given entity.
 * Async methods retry once after resetting the pool on Fly connection drops.
 */
export async function getCachedRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  return withDbRetry(async () => {
    const ds = await ensureDataSourceInitialized();
    const cached = repositoryCache.get(entity);
    if (cached && cached.ds === ds) {
      return wrapRepositoryWithRetry(cached.repo as Repository<T>);
    }

    const repo = ds.getRepository(entity);
    repositoryCache.set(entity, { ds, repo });
    return wrapRepositoryWithRetry(repo);
  });
}

export function clearRepositoryCache(): void {
  repositoryCache.clear();
}

export async function getRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  return getCachedRepository(entity);
}
