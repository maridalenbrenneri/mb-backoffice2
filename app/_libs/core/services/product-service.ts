import * as woo from '~/_libs/woo';
import { getProductById } from '../repositories/product';
import type { WooProductUpdate } from '~/_libs/woo/products/types';
import { ProductStockStatus } from '@prisma/client';

async function update(productId: number, data: WooProductUpdate) {
  const product = await getProductById(productId);
  if (!product || !product.wooProductId)
    return { kind: 'error', error: 'Product not found or no woo product id' };

  return await woo.productUpdate(product.wooProductId, data);
}

export async function productSetStockStatus(
  productId: number,
  stockStatus: ProductStockStatus
) {
  let stock_status =
    stockStatus === ProductStockStatus.IN_STOCK ? 'instock' : 'outofstock';

  const data: WooProductUpdate = {
    stock_status,
  };

  return await update(productId, data);
}

export async function productSetPrivate(productId: number) {
  const data: WooProductUpdate = {
    status: 'private',
  };

  return await update(productId, data);
}
