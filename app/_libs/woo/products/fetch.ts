import { DateTime } from 'luxon';

import { WOO_IMPORT_PRODUCTS_UPDATED_TODAY_MINUS_DAYS } from '~/settings';
import { WOO_API_DEFAULT_PER_PAGE, WOO_API_BASE_URL } from '../constants';
import { WooProductData, type WooProduct } from './types';

async function fetchPage(
  page: number = 1,
  updatedAfter: string
): Promise<{ nextPage: number | null; products: WooProduct[] }> {
  const url = `${WOO_API_BASE_URL}products?page=${page}&per_page=${WOO_API_DEFAULT_PER_PAGE}&modified_after=${updatedAfter}&${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `Fetch Woo orders failed. ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const validated = data.map((item: any) => {
    const result = WooProductData.safeParse(item);
    if (!result.success) {
      console.warn(
        'Invalid Woo product data',
        item.id,
        item.name,
        result.error
      );
    }
    return result;
  });

  const validData = validated
    .filter((result: any) => result.success)
    .map((result: any) => result.data);

  const totalPages = Number(response.headers.get('x-wp-totalpages'));
  const nextPage = !totalPages || totalPages === page ? null : page + 1;

  return {
    nextPage,
    products: validData,
  };
}

export async function fetchProducts(): Promise<WooProduct[]> {
  let orders: Array<WooProduct> = [];

  const updatedAfter = DateTime.now()
    .startOf('day')
    .minus({ days: WOO_IMPORT_PRODUCTS_UPDATED_TODAY_MINUS_DAYS })
    .toISO({ suppressMilliseconds: true, includeOffset: false });

  let page: number | null = 1;
  do {
    const result = await fetchPage(page, updatedAfter);
    page = result.nextPage;
    orders = orders.concat(result.products);
  } while (page);

  return orders;
}
