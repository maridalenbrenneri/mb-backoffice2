import { DateTime } from 'luxon';

import { fetchGiftSubscriptionOrders } from './orders/fetch';
import type { GiftSubscriptionCreateInput } from '../core/models/subscription.server';
import { createGiftSubscription } from '../core/models/subscription.server';
import { createImportResult } from '../core/models/import-result.server';

export default async function importWooGiftSubscriptions() {
  const startTimeStamp = DateTime.now().toJSDate();

  console.debug('FETCHING WOO GIFT SUBSCRIPTIONS...');

  let giftSubscriptions: GiftSubscriptionCreateInput[] = [];
  const errors: Error[] = [];

  try {
    giftSubscriptions = await fetchGiftSubscriptionOrders();
  } catch (err) {
    errors.push(err);
    throw err;
  }

  if (!errors.length) {
    try {
      for (const subscription of giftSubscriptions) {
        await createGiftSubscription(subscription);
      }
    } catch (err) {
      errors.push(err);
      throw err;
    }
  }

  const result = {
    importStartedAt: startTimeStamp,
    name: 'woo-import-subscriptions',
    result: giftSubscriptions.length
      ? JSON.stringify(`{upserted: ${giftSubscriptions.length}`)
      : null,
    errors: errors?.length ? errors[0].message : null,
  };

  await createImportResult(result);

  console.debug(' => DONE');

  return {
    importStartedAt: startTimeStamp,
    name: 'woo-import-subscriptions',
    result: { upserted: giftSubscriptions.length },
    errors: errors?.length ? errors[0] : null,
  };
}
