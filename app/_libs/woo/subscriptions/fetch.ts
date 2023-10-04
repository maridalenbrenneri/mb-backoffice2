import * as constants from '../constants';
import type { WooSubscription } from './types';

async function _fetchSubscriptions(page: number = 1): Promise<{
  nextPage: number | null;
  subscriptions: WooSubscription[];
}> {
  console.debug(`Fetching woo subscriptions from page ${page}`);

  // const after = DateTime.now()
  //   .startOf('day')
  //   .minus({ days: 15 })
  //   .toISO({ suppressMilliseconds: true, includeOffset: false });
  // &after=${after}

  const url = `${constants.WOO_SUBSCRIPTION_API_BASE_URL}subscriptions?page=${page}&per_page=${constants.WOO_API_DEFAULT_PER_PAGE}&${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `Fetch Woo subscriptions failed. ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const totalPages = Number(response.headers.get('x-wp-totalpages'));
  const nextPage = !totalPages || totalPages === page ? null : page + 1;

  return {
    nextPage,
    subscriptions: data,
  };
}

export default async function fetchSubscriptions(): Promise<WooSubscription[]> {
  let wooSubscriptions: Array<any> = [];
  let page: number | null = 1;

  do {
    const result: any = await _fetchSubscriptions(page);
    page = result.nextPage;
    wooSubscriptions = wooSubscriptions.concat(result.subscriptions);
  } while (page);

  return wooSubscriptions;
}
