import * as subscriptionRepository from '~/_libs/core/repositories/subscription';
import type { GiftSubscriptionCreateInput } from '~/_libs/core/repositories/subscription';

import { fetchGiftSubscriptionOrders } from './orders/fetch';

export default async function importWooGiftSubscriptions() {
  console.debug('FETCHING WOO GIFT SUBSCRIPTIONS...');

  let giftSubscriptions: GiftSubscriptionCreateInput[] = [];

  giftSubscriptions = await fetchGiftSubscriptionOrders();

  for (const subscription of giftSubscriptions) {
    await subscriptionRepository.createGiftSubscription(subscription);
  }

  console.debug(' => DONE');

  return { upsertedCount: giftSubscriptions.length };
}
