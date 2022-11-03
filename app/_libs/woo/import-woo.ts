import { DateTime } from 'luxon';

import fetchSubscriptions from './subscriptions/fetch';
import resolveSubscriptionData from './subscriptions/stats-data';
import { fetchGiftSubscriptionOrders, fetchOrders } from './orders/fetch';
import { createWooImportResult } from '../core/models/woo-import-result.server';
import { createGiftSubscriptionWithSubscriptionRelation } from '../core/models/subscription.server';

const importWooData = async () => {
  const IMPORT_ORDERS = false;
  const IMPORT_GIFT_SUBSCRIPTIONS = true;
  const IMPORT_SUBSCRIPTIONS = true;

  console.debug('START IMPORT WOO DATA');

  const startTimeStamp = DateTime.now().toISO();
  const errors: string[] = [];

  let orders = [];
  let giftSubscriptions = [];
  let subscriptionData;

  if (IMPORT_ORDERS) {
    console.debug('FETCHING ORDERS...');

    try {
      orders = await fetchOrders();
    } catch (e: any) {
      errors.push(e.message);
      console.warn(e);
    }
    console.debug(' => DONE');

    console.debug('UPSERTING ORDERS...');

    // TODO ...

    console.debug(' => DONE', orders.length);
  }

  if (IMPORT_GIFT_SUBSCRIPTIONS) {
    console.debug('FETCHING GIFT SUBSCRIPTIONS...');

    try {
      giftSubscriptions = await fetchGiftSubscriptionOrders();
    } catch (e: any) {
      errors.push(e.message);
      console.warn(e);
    }

    console.debug(' => DONE', giftSubscriptions.length);

    console.debug('UPSERTING GIFT SUBSCRIPTIONS...');

    for (const subscription of giftSubscriptions) {
      await createGiftSubscriptionWithSubscriptionRelation(subscription);
    }

    console.debug(' => DONE');
  }

  if (IMPORT_SUBSCRIPTIONS) {
    console.debug('FETCHING SUBSCRIPTIONS...');

    let subscriptions = [];
    try {
      subscriptions = await fetchSubscriptions();
    } catch (e: any) {
      errors.push(e.message);
      console.warn(e);
    }

    subscriptionData = resolveSubscriptionData(subscriptions);

    console.debug(' => DONE', subscriptions.length);
  }

  const completeTimeStamp = DateTime.now().toISO();

  console.debug('DONE IMPORTING WOO DATA');

  const result = {
    importStarted: startTimeStamp,
    importCompleted: completeTimeStamp,
    success: !errors?.length,
    errors,
    subscriptionData,
    orders: orders?.length,
    giftSubscriptions: giftSubscriptions?.length,
  };

  await createWooImportResult({ result: JSON.stringify(result) });

  return result;
};

export default importWooData;
