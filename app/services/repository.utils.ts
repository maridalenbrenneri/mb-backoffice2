import { Repository, EntityTarget, ObjectLiteral, DataSource } from 'typeorm';
import { ensureDataSourceInitialized } from '~/typeorm/data-source';

// Cache for repository instances (invalidated when DataSource is replaced)
const repositoryCache = new Map<
  EntityTarget<any>,
  { ds: DataSource; repo: Repository<any> }
>();

/**
 * Get a cached repository instance for the given entity
 * This reduces the overhead of repeatedly calling getRepository
 */
export async function getCachedRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  const ds = await ensureDataSourceInitialized();
  const cached = repositoryCache.get(entity);
  if (cached && cached.ds === ds) {
    return cached.repo as Repository<T>;
  }

  const repo = ds.getRepository(entity);
  repositoryCache.set(entity, { ds, repo });

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
