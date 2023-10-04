import * as subscriptionRepository from '~/_libs/core/repositories/subscription';
import type { WooGiftSubscriptionCreateInput } from '~/_libs/core/repositories/subscription';

import { fetchGiftSubscriptionOrders } from './orders/fetch';

export default async function importWooGiftSubscriptions() {
  console.debug('FETCHING WOO GIFT SUBSCRIPTIONS...');

  let giftSubscriptions: WooGiftSubscriptionCreateInput[] = [];

  giftSubscriptions = await fetchGiftSubscriptionOrders();

  for (const subscription of giftSubscriptions) {
    await subscriptionRepository.createGiftSubscriptionFromWoo(subscription);
  }

  let res = { upsertedCount: giftSubscriptions.length };

  console.debug(`=> DONE`, res);

  return res;
}
