import type { Product } from '@prisma/client';

export type { Product };

// WOO IMPORT
export type WooUpsertProductData = Pick<
  Product,
  | 'name'
  | 'status'
  | 'stockStatus'
  | 'category'
  | 'wooProductId'
  | 'wooProductUrl'
  | 'wooCreatedAt'
  | 'wooUpdatedAt'
>;
