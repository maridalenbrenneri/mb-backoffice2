import { DateTime } from 'luxon';

import fetchSubscriptions from './subscriptions/fetch';
import resolveSubscriptionStats from './subscriptions/stats-data';
import { createImportResult } from '../core/models/import-result.server';

export default async function importWooSubscriptionStats() {
  const startTimeStamp = DateTime.now().toJSDate();

  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  let subscriptions = [];
  let subscriptionStats;
  const errors: string[] = [];

  try {
    subscriptions = await fetchSubscriptions();
  } catch (err) {
    errors.push(err.message);
  }

  if (!errors?.length) {
    try {
      subscriptionStats = resolveSubscriptionStats(subscriptions);
    } catch (err) {
      errors.push(err.message);
    }
  }

  const result = {
    importStartedAt: startTimeStamp,
    name: 'woo-import-subscription-stats',
    result: subscriptionStats ? JSON.stringify(subscriptionStats) : null,
    errors: errors?.length ? errors.join() : null,
  };

  await createImportResult(result);

  console.debug(`=> DONE (${subscriptions.length} fetched)`);

  return result;
}
