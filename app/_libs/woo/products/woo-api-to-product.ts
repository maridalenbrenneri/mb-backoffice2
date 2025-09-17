import { ProductStatus, ProductStockStatus } from '~/services/entities/enums';
import { WooSyncProductWithDataFromWooInput } from '~/services/product.service';

import { type WooProduct } from './types';

const mapProductStatus = (wooStatus: string): ProductStatus => {
  if (wooStatus === 'draft') return ProductStatus.DRAFT;
  if (wooStatus === 'private') return ProductStatus.PRIVATE;
  if (wooStatus === 'publish') return ProductStatus.PUBLISHED;

  console.warn(`Unknown status on product imported from Woo: "${wooStatus}"`);

  return ProductStatus.PRIVATE;
};

const mapProductStockStatus = (wooStatus: string): ProductStockStatus => {
  if (wooStatus === 'onbackorder') return ProductStockStatus.ON_BACKORDER;
  if (wooStatus === 'instock') return ProductStockStatus.IN_STOCK;
  if (wooStatus === 'outofstock') return ProductStockStatus.OUT_OF_STOCK;

  console.warn(
    `Unknown stock status on product imported from Woo: "${wooStatus}"`
  );

  return ProductStockStatus.OUT_OF_STOCK;
};

export default async function wooApiToProductEntity(
  wooProduct: WooProduct
): Promise<WooSyncProductWithDataFromWooInput> {
  return {
    wooProductId: wooProduct.id,
    status: mapProductStatus(wooProduct.status),
    stockStatus: mapProductStockStatus(wooProduct.stock_status),
    images: wooProduct.images.map((image) => ({
      wooMediaId: image.id,
      src: image.src,
    })),
    wooUpdatedAt: new Date(wooProduct.date_modified),
    wooProductUrl: wooProduct.permalink,
  };
}

// No longer used, kept here for reference
// const resolveProductCategory = (wooProductId: number): string => {
//   if (
//     [
//       456, // Abo
//       968, // Gabo
//       45168, // Testprodukt
//       46248, // Test abo vipps
//     ].includes(wooProductId)
//   ) {
//     return 'other';
//   }

//   return 'coffee';
// };
