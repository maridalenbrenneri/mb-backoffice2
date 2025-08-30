import { DateTime } from 'luxon';
import * as constants from '../constants';
import type { WooSubscription } from './types';
import { WOO_IMPORT_SUBSCRIPTIONS_FROM_TODAY_MINUS_DAYS } from '~/settings';

async function _fetchSubscriptions(
  page: number = 1,
  fetchAll: boolean = false
): Promise<{
  nextPage: number | null;
  subscriptions: WooSubscription[];
}> {
  console.debug(`Fetching woo subscriptions from page ${page}`);

  let days = fetchAll ? 30 : WOO_IMPORT_SUBSCRIPTIONS_FROM_TODAY_MINUS_DAYS;

  const after = DateTime.now()
    .startOf('day')
    .minus({ days })
    .toISO({ suppressMilliseconds: true, includeOffset: false });

  const url = `${constants.WOO_SUBSCRIPTION_API_BASE_URL}subscriptions?modified_after=${after}&page=${page}&per_page=${constants.WOO_API_DEFAULT_PER_PAGE}&${process.env.WOO_SECRET_PARAM}`;

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

export default async function fetchSubscriptions(
  fetchAll: boolean = false
): Promise<WooSubscription[]> {
  let wooSubscriptions: Array<any> = [];
  let page: number | null = 1;

  do {
    const result: any = await _fetchSubscriptions(page, fetchAll);
    page = result.nextPage;
    wooSubscriptions = wooSubscriptions.concat(result.subscriptions);
  } while (page);

  return wooSubscriptions;
}
