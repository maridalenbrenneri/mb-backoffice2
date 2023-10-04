import * as subscriptionRepository from '../core/repositories/subscription';
import fetchSubscriptions from './subscriptions/fetch';
import { wooApiToUpsertSubscriptionData } from './subscriptions/woo-api-to-subscription';

export default async function importWooSubscriptionStats() {
  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  const wooSubscriptions = await fetchSubscriptions();

  console.debug(`Fetched ${wooSubscriptions.length} subscriptions from Woo`);

  let created = 0;
  let updated = 0;
  let notChanged = 0;

  let upsertData = wooSubscriptions.map((s) =>
    wooApiToUpsertSubscriptionData(s)
  );

  for (const data of upsertData) {
    let res = await subscriptionRepository.upsertSubscriptionFromWoo(data);

    if (res.result === 'new') created++;
    else if (res.result === 'updated') updated++;
    else if (res.result === 'notChanged') notChanged++;
    else throw new Error(`Error when writing to database`);
  }

  let res = {
    created,
    updated,
    notChanged,
  };

  console.debug(`=> DONE`, res);

  return res;
}
