import { upsertSubscriptionByWooSubscriptionId } from '../core/models/subscription.server';
import fetchSubscriptions from './subscriptions/fetch';

export default async function importWooSubscriptionStats() {
  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  const subscriptions = await fetchSubscriptions();

  for (const subscription of subscriptions) {
    console.debug('UPSERTING WOO SUBSCRIPTION', subscription);
    await upsertSubscriptionByWooSubscriptionId(subscription);
  }

  console.debug(`=> DONE (${subscriptions.length} fetched)`);

  return `Upserted ${subscriptions.length} Woo subscriptions`;
}
