import { ProductStatus, ProductStockStatus } from '@prisma/client';
import { type WooProduct } from './types';
import type { WooUpsertProductData } from '~/_libs/core/repositories/product/types';

const resolveProductStatus = (wooStatus: string): ProductStatus => {
  if (wooStatus === 'private') return ProductStatus.PRIVATE;
  if (wooStatus === 'publish') return ProductStatus.PUBLISHED;

  console.warn(`Unknown status on product imported from Woo: "${wooStatus}"`);

  return ProductStatus.PRIVATE;
};

const resolveProductStockStatus = (wooStatus: string): ProductStockStatus => {
  if (wooStatus === 'instock') return ProductStockStatus.IN_STOCK;
  if (wooStatus === 'outofstock') return ProductStockStatus.OUT_OF_STOCK;

  console.warn(
    `Unknown stock status on product imported from Woo: "${wooStatus}"`
  );

  return ProductStockStatus.OUT_OF_STOCK;
};

export default async function wooApiToProductUpsertData(
  wooProduct: WooProduct
): Promise<WooUpsertProductData> {
  const product: WooUpsertProductData = {
    wooProductId: wooProduct.id,

    status: resolveProductStatus(wooProduct.status),
    stockStatus: resolveProductStockStatus(wooProduct.stock_status),

    wooCreatedAt: new Date(wooProduct.date_created),
    wooUpdatedAt: new Date(wooProduct.date_modified),
    wooProductUrl: wooProduct.permalink,

    name: wooProduct.name,
    category: 'coffee',
  };

  return product;
}
