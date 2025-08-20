import { Repository, EntityTarget, ObjectLiteral } from 'typeorm';
import { ensureDataSourceInitialized } from '~/typeorm/data-source';

// Cache for repository instances
const repositoryCache = new Map<EntityTarget<any>, Repository<any>>();

/**
 * Get a cached repository instance for the given entity
 * This reduces the overhead of repeatedly calling getRepository
 */
export async function getCachedRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  if (repositoryCache.has(entity)) {
    return repositoryCache.get(entity) as Repository<T>;
  }

  const ds = await ensureDataSourceInitialized();
  const repo = ds.getRepository(entity);
  repositoryCache.set(entity, repo);

  return repo;
}

/**
 * Clear the repository cache (useful for testing or when connections are reset)
 */
export function clearRepositoryCache(): void {
  repositoryCache.clear();
}

/**
 * Get repository with proper typing
 */
export async function getRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  return getCachedRepository(entity);
}
