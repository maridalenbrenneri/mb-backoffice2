import { DateTime } from 'luxon';
import type { GiftSubscriptionWithSubscriptionCreateInput } from '~/_libs/core/models/subscription.server';

import {
  WOO_API_DEFAULT_PER_PAGE,
  WOO_API_BASE_URL,
  WOO_GABO_PRODUCT_ID,
  // WOO_STATUS_ON_HOLD,
  // WOO_STATUS_PROCESSING,
} from '../settings';
import wooApiToGiftSubscriptions from './woo-api-to-giftsubscriptions';
// import wooApiToOrder from './woo-api-to-order';

// async function _fetchOrders(page: number = 1, status: string, after: string) {
//   const url = `${WOO_API_BASE_URL}orders?page=${page}&per_page=${WOO_API_DEFAULT_PER_PAGE}&status=${status}&after=${after}&${process.env.WOO_SECRET_PARAM}`;

//   const response = await fetch(url);

//   const data = await response.json();

//   if (!response.body) {
//     return {
//       nextPage: null,
//       orders: [],
//     };
//   }

//   return {
//     nextPage:
//       response.headers.get('x-wp-totalpages') === `${page}` ? null : page + 1,
//     orders: data,
//   };
// }

async function _fetchGiftSubscriptionOrders(page: number = 1) {
  const fromCreatedDate = DateTime.now()
    .minus({ months: 13 })
    .startOf('day')
    .toISO({ suppressMilliseconds: true, includeOffset: false });

  const url = `${WOO_API_BASE_URL}orders?product=${WOO_GABO_PRODUCT_ID}&page=${page}&per_page=${WOO_API_DEFAULT_PER_PAGE}&after=${fromCreatedDate}&${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.body) {
    return {
      nextPage: null,
      orders: [],
    };
  }
  return {
    nextPage:
      response.headers.get('x-wp-totalpages') === `${page}` ? null : page + 1,
    orders: data,
  };
}

export async function fetchOrders(): Promise<any[]> {
  // TODO: EXCLUDE GIFT SUBSCRIPTION ITEMS

  // let ordersInProcess: Array<any> = [];
  // let ordersOnHold: Array<any> = [];

  // const yesterday = DateTime.now()
  //   .plus({ days: -10 })
  //   .startOf("second")
  //   .toUTC()
  //   .toISO({ suppressMilliseconds: true, includeOffset: false });

  // let page: number | null = 1;
  // do {
  //   const result = (await _fetchOrders(
  //     page,
  //     WOO_STATUS_PROCESSING,
  //     yesterday
  //   )) as any;
  //   page = result.nextPage;
  //   ordersInProcess = ordersInProcess.concat(result.orders);
  // } while (page);

  // page = 1;
  // do {
  //   const result = (await _fetchOrders(
  //     page,
  //     WOO_STATUS_ON_HOLD,
  //     yesterday
  //   )) as any;
  //   page = result.nextPage;
  //   ordersOnHold = ordersOnHold.concat(result.orders);
  // } while (page);

  // const allOrders = ordersInProcess.concat(ordersOnHold);

  return []; // allOrders.map(wooApiToOrder);
}

export async function fetchGiftSubscriptionOrders(): Promise<
  GiftSubscriptionWithSubscriptionCreateInput[]
> {
  let giftSubscriptionOrders: Array<any> = [];
  let page: number | null = 1;

  // do {
  const result = (await _fetchGiftSubscriptionOrders(page)) as any;
  page = result.nextPage;
  giftSubscriptionOrders = giftSubscriptionOrders.concat(result.orders);
  // } while (page);

  return wooApiToGiftSubscriptions(giftSubscriptionOrders);
}
