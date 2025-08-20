import * as subscriptionRepository from '~/services/subscription.service';
import fetchSubscriptions from './subscriptions/fetch';
import { wooApiToUpsertSubscriptionData } from './subscriptions/woo-api-to-subscription';

export default async function importWooSubscriptionStats() {
  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  const wooSubscriptions = await fetchSubscriptions();

  console.debug(`Fetched ${wooSubscriptions.length} subscriptions from Woo`);

  let created = 0;
  let updated = 0;
  let notChanged = 0;
  let invalidItems: number[] = [];

  let upsertData: any[] = [];

  wooSubscriptions.forEach((s) => {
    let data = wooApiToUpsertSubscriptionData(s);
    if (data) upsertData.push(data);
    else invalidItems.push(s.id);
  });

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
    errors: invalidItems.length
      ? `Invalid items, most likely unknown subscription product id. Subscription ids: ${invalidItems.join(
          ', '
        )}`
      : null,
  };

  console.debug(`=> DONE`, res);

  return res;
}
