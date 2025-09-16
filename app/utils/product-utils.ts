import { ProductEntity } from '~/services/entities';

export const DESCRIPTION_FOOTER =
  'I en pose er det 250 g hele bønner. Vi velger kun spesialkaffe av den absolutt beste kvaliteten fra øverste hylle, som vi brenner med det vi mener er en optimal profil.';

export function createFullProductName(product: Partial<ProductEntity>) {
  if (!product.coffee_country) return product.name || 'No name';

  return `${product.coffee_country} - ${product.name}`;
}

export function createFullProductDescription(product: Partial<ProductEntity>) {
  return `
    ${product.description} 
    
    ${product.coffee_beanType ? `Bønnetype: ${product.coffee_beanType}` : ''}
    ${
      product.coffee_processType
        ? `Prosess: ${getProcessTypeDisplayName(
            product.coffee_processType || ''
          )}`
        : ''
    }
    Cuppingscore: ${product.coffee_cuppingScore || ''}
    
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

export function validateCoffeForPublication(product: ProductEntity) {
  let errors: string[] = [];
  let warnings: string[] = [];

  if (!product.coffee_country) {
    errors.push('Country');
  }

  if (!product.name) {
    errors.push('Name');
  }

  if (!product.coffee_processType) {
    errors.push('Process type');
  }

  if (!product.coffee_cuppingScore) {
    errors.push('Cupping score');
  }

  if (!product.description?.trim().length) {
    errors.push('Description');
  }

  if (!product.coffee_beanType) {
    warnings.push('Bean type');
  }

  if (product.description && product.description.length < 50) {
    warnings.push('Description is very short');
  }

  return {
    errors,
    warnings,
  };
}
