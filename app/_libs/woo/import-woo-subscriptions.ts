import { upsertSubscriptionFromWoo } from '../core/models/subscription.server';
import fetchSubscriptions from './subscriptions/fetch';

export default async function importWooSubscriptionStats() {
  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  const subscriptions = await fetchSubscriptions();

  console.debug(`Fetched ${subscriptions.length} subscriptions from Woo`);

  let created = 0;
  let updated = 0;
  let notChanged = 0;

  for (const subscription of subscriptions) {
    let res = await upsertSubscriptionFromWoo(subscription);

    if (res.result === 'new') created++;
    else if (res.result === 'updated') updated++;
    else if (res.result === 'notChanged') notChanged++;
    else throw new Error(`Error when writing to database`);
  }

  console.debug(`=> DONE (${subscriptions.length} synced)`);

  return {
    created,
    updated,
    notChanged,
  };
}
