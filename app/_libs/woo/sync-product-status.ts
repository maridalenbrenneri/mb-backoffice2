// import * as productRepository from '~/_libs/core/repositories/product';

import { woo_syncProductWithDataFromWoo } from '~/services/product.service';
import { fetchOne, fetchProducts } from './products/fetch';
import type { WooProduct } from './products/types';
import wooApiToProductUpsertData from './products/woo-api-to-product';

export async function fetchProduct(wooProductId: number) {
  const wooProduct = await fetchOne(wooProductId);

  if (!wooProduct) {
    console.warn(`Fetched failed for Woo product ${wooProductId}`);
    return null;
  }

  return await wooApiToProductUpsertData(wooProduct);
}

export default async function syncAllWooProducts() {
  console.debug('FETCHING WOO PRODUCTS...');

  let wooProducts: WooProduct[] = await fetchProducts();

  console.debug(`=> DONE (${wooProducts.length} fetched)`);

  console.debug('Products from Woo', wooProducts);

  let created = 0;
  let updated = 0;
  let notChanged = 0;
  let ignored = 0;

  for (const data of wooProducts) {
    const upsertData = await wooApiToProductUpsertData(data);

    const res = await woo_syncProductWithDataFromWoo(upsertData);

    if (res.result === 'updated') updated++;
    else if (res.result === 'notChanged') notChanged++;
    else throw new Error(`Error when writing to database`);
  }

  return {
    created,
    updated,
    notChanged,
    ignored,
  };
}
