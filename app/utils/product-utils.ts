import { ProductEntity } from '~/services/entities';

export const DESCRIPTION_FOOTER =
  'I en pose er det 250 g hele bønner. Vi velger kun spesialkaffe av den absolutt beste kvaliteten fra øverste hylle, som vi brenner med det vi mener er en optimal profil.';

export function createFullProductName(product: Partial<ProductEntity>) {
  if (!product.country) return product.name || 'No name';

  return `${product.country} - ${product.name}`;
}

export function createFullProductDescription(product: Partial<ProductEntity>) {
  return `
    ${product.description} 
    
    Bønnetype: ${product.beanType || ''}
    Prosess: ${getProcessTypeDisplayName(product.processType || '')}
    Cuppingscore: ${product.cuppingScore || ''}
    
    ${DESCRIPTION_FOOTER}`;
}

export function getProcessTypeDisplayName(processType: string) {
  if (!processType) return '';

  switch (processType) {
    case 'washed':
      return 'Vasket';
    case 'dry-processed':
      return 'Bærtørket';
    default:
      return processType;
  }
}
