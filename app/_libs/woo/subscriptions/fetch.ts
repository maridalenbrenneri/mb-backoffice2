import * as settings from '../settings';
import wooApiToSubscription from './woo-api-to-subscription';

async function _fetchSubscriptions(status: string, page: number = 1) {
  const url = `${settings.WOO_SUBSCRIPTION_API_BASE_URL}subscriptions?page=${page}&per_page=${settings.WOO_API_DEFAULT_PER_PAGE}&${process.env.WOO_SECRET_PARAM}&status=${status}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.body) {
    return {
      nextPage: null,
      abos: [],
    };
  }

  const nextPage =
    response.headers.get('x-wp-totalpages') === `${page}` ? null : page + 1;

  return {
    nextPage,
    abos: data,
  };
}

export default async function fetchSubscriptions(): Promise<any[]> {
  let subscriptionActive: Array<any> = [];
  let subscriptionOnHold: Array<any> = [];
  let page: number | null = 1;

  do {
    const result = (await _fetchSubscriptions(
      settings.WOO_STATUS_ACTIVE,
      page
    )) as any;
    page = result.nextPage;
    subscriptionActive = subscriptionActive.concat(result.abos);
  } while (page);

  page = 1;
  do {
    const result2 = (await _fetchSubscriptions(
      settings.WOO_STATUS_ON_HOLD,
      page
    )) as any;
    page = result2.nextPage;
    subscriptionOnHold = subscriptionOnHold.concat(result2.abos);
  } while (page);

  const allSubscriptions = subscriptionActive.concat(subscriptionOnHold);

  return allSubscriptions.map(wooApiToSubscription);
}
