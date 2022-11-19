import { DateTime } from 'luxon';

import fetchSubscriptions from './subscriptions/fetch';
import resolveSubscriptionStats from './subscriptions/stats-data';
import { fetchGiftSubscriptionOrders, fetchOrders } from './orders/fetch';
import type { GiftSubscriptionCreateInput } from '../core/models/subscription.server';
import { createGiftSubscription } from '../core/models/subscription.server';
import { createWooImportResult } from '../core/models/woo-import-result.server';
import { upsertOrderFromWoo } from '../core/models/order.server';
import { getNextDelivery } from '../core/services/delivery-service';
import wooApiToOrder from './orders/woo-api-to-order';
import { WOO_RENEWALS_SUBSCRIPTION_ID } from '../core/settings';

const importWooData = async ({
  IMPORT_ORDERS = false,
  IMPORT_SUBSCRIPTIONS = false,
  IMPORT_GIFT_SUBSCRIPTIONS = false,
}) => {
  console.debug('START IMPORT WOO DATA');

  const startTimeStamp = DateTime.now().toISO();
  const errors: string[] = [];

  let orders = [];
  let giftSubscriptions: GiftSubscriptionCreateInput[] = [];
  let subscriptions = [];
  let subscriptionStats;

  const nextDelivery = await getNextDelivery();

  if (IMPORT_ORDERS) {
    console.debug('FETCHING ORDERS...');

    let wooOrders: any[] = [];

    try {
      wooOrders = await fetchOrders();
    } catch (err) {
      errors.push(err.message);
    }

    console.debug(`=> DONE (${wooOrders.length} fetched)`);

    // console.debug('UPSERTING ORDERS...', wooOrders);

    orders = wooOrders.map((wo) =>
      wooApiToOrder(wo, WOO_RENEWALS_SUBSCRIPTION_ID, nextDelivery.id)
    );

    for (const order of orders) {
      for (const gift of order.gifts) {
        await createGiftSubscription(gift);
      }

      if (order.items.length) {
        // IF NOT, ORDER ONLY HAVE GIFT SUBSCRIPTIONS
        // TODO: CREATE THE ITEMS...
        await upsertOrderFromWoo(order.order.wooOrderId as number, order.order);
      }
    }

    console.debug(' => DONE');
  }

  if (IMPORT_GIFT_SUBSCRIPTIONS) {
    console.debug('FETCHING GIFT SUBSCRIPTIONS...');

    try {
      giftSubscriptions = await fetchGiftSubscriptionOrders();
    } catch (err) {
      errors.push(err.message);
    }

    console.debug(`=> DONE (${giftSubscriptions.length} fetched)`);

    console.debug('UPSERTING GIFT SUBSCRIPTIONS...');

    for (const subscription of giftSubscriptions) {
      await createGiftSubscription(subscription);
    }

    console.debug(' => DONE');
  }

  if (IMPORT_SUBSCRIPTIONS) {
    console.debug('FETCHING SUBSCRIPTIONS...');

    try {
      subscriptions = await fetchSubscriptions();
    } catch (err) {
      errors.push(err.message);
    }

    subscriptionStats = resolveSubscriptionStats(subscriptions);

    console.debug(`=> DONE (${subscriptions.length} fetched)`);
  }

  const completeTimeStamp = DateTime.now().toISO();

  console.debug('DONE IMPORTING WOO DATA');

  const result = {
    importStarted: startTimeStamp,
    importCompleted: completeTimeStamp,
    success: !errors?.length,
    errors,
    subscriptionStats,
  };

  await createWooImportResult({ result: JSON.stringify(result) });

  return result;
};

export default importWooData;
