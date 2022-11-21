import { fetchGiftSubscriptionOrders } from './orders/fetch';
import type { GiftSubscriptionCreateInput } from '../core/models/subscription.server';
import { createGiftSubscription } from '../core/models/subscription.server';

export default async function importWooGiftSubscriptions() {
  console.debug('FETCHING WOO GIFT SUBSCRIPTIONS...');

  let giftSubscriptions: GiftSubscriptionCreateInput[] = [];

  giftSubscriptions = await fetchGiftSubscriptionOrders();

  for (const subscription of giftSubscriptions) {
    await createGiftSubscription(subscription);
  }

  console.debug(' => DONE');

  return { upsertedCount: giftSubscriptions.length };
}
