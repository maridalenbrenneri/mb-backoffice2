import fetchSubscriptions from './subscriptions/fetch';
import resolveSubscriptionStats from './subscriptions/stats-data';

export default async function importWooSubscriptionStats() {
  console.debug('FETCHING WOO SUBSCRIPTIONS...');

  const subscriptions = await fetchSubscriptions();
  const subscriptionStats = resolveSubscriptionStats(subscriptions);

  console.debug(`=> DONE (${subscriptions.length} fetched)`);

  return subscriptionStats;
}
