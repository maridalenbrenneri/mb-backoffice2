import { ProductStatus, ProductStockStatus } from '~/services/entities/enums';
import { type WooProduct } from './types';
import { WooUpsertProductData } from '~/services/product.service';

const resolveProductStatus = (wooStatus: string): ProductStatus => {
  if (wooStatus === 'private') return ProductStatus.PRIVATE;
  if (wooStatus === 'publish') return ProductStatus.PUBLISHED;

  console.warn(`Unknown status on product imported from Woo: "${wooStatus}"`);

  return ProductStatus.PRIVATE;
};

const resolveProductStockStatus = (wooStatus: string): ProductStockStatus => {
  if (wooStatus === 'onbackorder') return ProductStockStatus.ON_BACKORDER;
  if (wooStatus === 'instock') return ProductStockStatus.IN_STOCK;
  if (wooStatus === 'outofstock') return ProductStockStatus.OUT_OF_STOCK;

  console.warn(
    `Unknown stock status on product imported from Woo: "${wooStatus}"`
  );

  return ProductStockStatus.OUT_OF_STOCK;
};

const resolveProductCategory = (wooProductId: number): string => {
  if (
    [
      456, // Abo
      968, // Gabo
      45168, // Testprodukt
      46248, // Test abo vipps
    ].includes(wooProductId)
  ) {
    return 'other';
  }

  return 'coffee';
};

export default async function wooApiToProductUpsertData(
  wooProduct: WooProduct
): Promise<WooUpsertProductData> {
  const product: WooUpsertProductData = {
    wooProductId: wooProduct.id,

    status: resolveProductStatus(wooProduct.status),
    stockStatus: resolveProductStockStatus(wooProduct.stock_status),

    wooCreatedAt: wooProduct.date_created
      ? new Date(wooProduct.date_created)
      : new Date(wooProduct.date_modified),
    wooUpdatedAt: new Date(wooProduct.date_modified),
    wooProductUrl: wooProduct.permalink,

    name: wooProduct.name,
    category: resolveProductCategory(wooProduct.id),
  };

  return product;
}
