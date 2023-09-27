import { DateTime } from 'luxon';
import { z } from 'zod';

import type { GiftSubscriptionCreateInput } from '~/_libs/core/models/subscription.server';
import {
  WOO_GABO_PRODUCT_ID,
  WOO_IMPORT_ORDERS_FROM_TODAY_MINUS_DAYS,
} from '~/_libs/core/settings';
import { WOO_API_DEFAULT_PER_PAGE, WOO_API_BASE_URL } from '../constants';
import wooApiToGiftSubscriptions from './woo-api-to-giftsubscriptions';
import { WooOrderData, type WooOrder } from '../types';

async function fetchPage(
  page: number = 1,
  updatedAfter: string
): Promise<{ nextPage: number | null; orders: WooOrder[] }> {
  const url = `${WOO_API_BASE_URL}orders?page=${page}&per_page=${WOO_API_DEFAULT_PER_PAGE}&modified_after=${updatedAfter}&${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `Fetch Woo orders failed. ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const validated = z.array(WooOrderData).safeParse(data);
  if (validated.success === false) {
    throw new Error(`Unable to parse Woo order data ${validated.error}`);
  }

  const totalPages = Number(response.headers.get('x-wp-totalpages'));
  const nextPage = !totalPages || totalPages === page ? null : page + 1;

  return {
    nextPage,
    orders: validated.data,
  };
}

async function _fetchGiftSubscriptionOrders(page: number = 1) {
  const updatedAfter = DateTime.now()
    .startOf('day')
    .minus({ months: 13 })
    .toISO({ suppressMilliseconds: true, includeOffset: false });

  const url = `${WOO_API_BASE_URL}orders?product=${WOO_GABO_PRODUCT_ID}&page=${page}&per_page=${WOO_API_DEFAULT_PER_PAGE}&modified_after=${updatedAfter}&${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `Fetch Woo orders (gift subscriptions) failed. ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const totalPages = Number(response.headers.get('x-wp-totalpages'));
  const nextPage = !totalPages || totalPages === page ? null : page + 1;

  return {
    nextPage,
    orders: data,
  };
}

export async function fetchOrders(): Promise<WooOrder[]> {
  let orders: Array<WooOrder> = [];

  const updatedAfter = DateTime.now()
    .startOf('day')
    .minus({ days: WOO_IMPORT_ORDERS_FROM_TODAY_MINUS_DAYS })
    .toISO({ suppressMilliseconds: true, includeOffset: false });

  let page: number | null = 1;
  do {
    const result = await fetchPage(page, updatedAfter);
    page = result.nextPage;
    orders = orders.concat(result.orders);
  } while (page);

  return orders;
}

// TO BE REMOVED - ONLY FOR INITAL IMPORT
export async function fetchGiftSubscriptionOrders(): Promise<
  GiftSubscriptionCreateInput[]
> {
  let giftSubscriptionOrders: Array<any> = [];
  let page: number | null = 1;

  do {
    const result = (await _fetchGiftSubscriptionOrders(page)) as any;
    page = result.nextPage;
    giftSubscriptionOrders = giftSubscriptionOrders.concat(result.orders);
  } while (page);

  return wooApiToGiftSubscriptions(giftSubscriptionOrders);
}
