export interface RelationsObject {
  [key: string]: true | RelationsObject;
}

function mergeRelationPath(root: RelationsObject, parts: string[]): void {
  let current = root;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLeaf = i === parts.length - 1;

    if (isLeaf) {
      const existing = current[part];
      if (!existing || existing === true) {
        current[part] = true;
      }
      continue;
    }

    const existing = current[part];
    if (existing === true || !existing || typeof existing !== 'object') {
      current[part] = {};
    }
    current = current[part] as RelationsObject;
  }
}

/** TypeORM v1 requires object relations; convert legacy string-array paths. */
export function normalizeRelations(
  relations: string[] | RelationsObject
): RelationsObject {
  if (!Array.isArray(relations)) {
    return relations;
  }

  const result: RelationsObject = {};
  for (const path of relations) {
    mergeRelationPath(result, path.split('.'));
  }
  return result;
}

export function resolveRelationsOption(filter: {
  include?: RelationsObject;
  relations?: string[] | RelationsObject;
}): RelationsObject | undefined {
  if (filter.include) {
    return filter.include;
  }
  if (filter.relations) {
    return normalizeRelations(filter.relations);
  }
  return undefined;
}
