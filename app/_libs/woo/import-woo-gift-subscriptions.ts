import { DateTime } from 'luxon';

import { fetchGiftSubscriptionOrders } from './orders/fetch';
import type { GiftSubscriptionCreateInput } from '../core/models/subscription.server';
import { createGiftSubscription } from '../core/models/subscription.server';
import { createImportResult } from '../core/models/import-result.server';

export default async function importWooGiftSubscriptions() {
  const startTimeStamp = DateTime.now().toJSDate();

  console.debug('FETCHING WOO GIFT SUBSCRIPTIONS...');

  let giftSubscriptions: GiftSubscriptionCreateInput[] = [];
  const errors: string[] = [];

  try {
    giftSubscriptions = await fetchGiftSubscriptionOrders();
  } catch (err) {
    errors.push(err.message);
  }

  if (!errors.length) {
    try {
      for (const subscription of giftSubscriptions) {
        await createGiftSubscription(subscription);
      }
    } catch (err) {
      errors.push(err.message);
    }
  }

  const result = {
    importStartedAt: startTimeStamp,
    name: 'woo-import-subscriptions',
    result: giftSubscriptions.length
      ? JSON.stringify(`{upserted: ${giftSubscriptions.length}`)
      : null,
    errors: errors?.length ? errors.join() : null,
  };

  await createImportResult(result);

  console.debug(' => DONE');

  return result;
}
