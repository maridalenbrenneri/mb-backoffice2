import { upsertSubscriptionByWooSubscriptionId } from '../core/models/subscription.server';
import fetchSubscriptions from './subscriptions/fetch';

export default async function importWooSubscriptionStats() {
  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  const subscriptions = await fetchSubscriptions();

  console.debug(`Upserting ${subscriptions.length} subscriptions from Woo`);

  for (const subscription of subscriptions) {
    await upsertSubscriptionByWooSubscriptionId(subscription);
  }

  console.debug(`=> DONE (${subscriptions.length} fetched)`);

  return `Upserted ${subscriptions.length} Woo subscriptions`;
}
