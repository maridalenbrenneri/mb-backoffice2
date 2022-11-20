import { DateTime } from 'luxon';

import fetchSubscriptions from './subscriptions/fetch';
import resolveSubscriptionStats from './subscriptions/stats-data';
import { fetchGiftSubscriptionOrders, fetchOrders } from './orders/fetch';
import type { GiftSubscriptionCreateInput } from '../core/models/subscription.server';
import { createGiftSubscription } from '../core/models/subscription.server';
import { createImportResult } from '../core/models/import-result.server';
import {
  upsertOrderFromWoo,
  upsertOrderItemFromWoo,
} from '../core/models/order.server';
import { getNextDelivery } from '../core/services/delivery-service';
import wooApiToOrder from './orders/woo-api-to-order';
import { WOO_RENEWALS_SUBSCRIPTION_ID } from '../core/settings';
import { getCoffees } from '../core/models/coffee.server';

export default async function wooImport(
  type: 'IMPORT_ORDERS' | 'IMPORT_SUBSCRIPTIONS' | 'IMPORT_GIFT_SUBSCRIPTIONS'
) {
  const startTimeStamp = DateTime.now().toJSDate();

  if (type === 'IMPORT_ORDERS') {
    console.debug('FETCHING WOO ORDERS...');

    const errors: Error[] = [];
    let wooOrders: any[] = [];
    let orderInfos: any[] = [];
    const ordersNotImported: number[] = [];
    let ordersUpsertedCount = 0;

    try {
      wooOrders = await fetchOrders();
    } catch (err) {
      errors.push(err);
    }

    console.debug(`=> DONE (${wooOrders.length} fetched)`);

    if (!errors.length) {
      const nextDelivery = await getNextDelivery();
      const coffees = await getCoffees();

      const getCoffeeIdFromCode = (code: string) => {
        const coffee = coffees.find((c) => c.productCode === code);
        return coffee?.id;
      };

      const verifyThatItemsAreValid = (items: any[], wooOrderId: number) => {
        if (items.some((i) => !getCoffeeIdFromCode(i.productCode))) {
          console.warn(
            `[woo-import-orders] Order contained item with invalid product code, import will ignore order. Woo order id: ${wooOrderId}`
          );
          ordersNotImported.push(wooOrderId);
          return false;
        }

        return true;
      };

      try {
        orderInfos = wooOrders.map((wo) =>
          wooApiToOrder(wo, WOO_RENEWALS_SUBSCRIPTION_ID, nextDelivery.id)
        );

        for (const info of orderInfos) {
          for (const gift of info.gifts) {
            await createGiftSubscription(gift);
          }

          // IF items IS EMPTY, ORDER ONLY HAVE GIFT SUBSCRIPTIONS
          if (info.items.length) {
            if (!verifyThatItemsAreValid(info.items, info.order.wooOrderId))
              continue;

            const orderCreated = await upsertOrderFromWoo(
              info.order.wooOrderId as number,
              info.order
            );

            for (const item of info.items) {
              const coffeeId = getCoffeeIdFromCode(
                item.productCode
              ) as unknown as number;

              await upsertOrderItemFromWoo(item.wooOrderItemId, {
                orderId: orderCreated.id,
                coffeeId,
                variation: '_250',
                quantity: item.quantity,
              });
            }
          }

          ordersUpsertedCount++;
        }
      } catch (err) {
        errors.push(err);
      }
    }

    const result = {
      importStartedAt: startTimeStamp,
      name: 'woo-import-orders',
      result: JSON.stringify({
        ordersUpsertedCount,
        ordersNotImported,
      }),
      errors: errors?.length ? errors.map((e) => e.message).join() : null,
    };

    await createImportResult(result);

    console.debug(' => DONE');

    return result;
  }

  if (type === 'IMPORT_GIFT_SUBSCRIPTIONS') {
    console.debug('FETCHING WOO GIFT SUBSCRIPTIONS...');

    let giftSubscriptions: GiftSubscriptionCreateInput[] = [];
    const errors: string[] = [];

    try {
      giftSubscriptions = await fetchGiftSubscriptionOrders();
    } catch (err) {
      errors.push(err.message);
    }

    if (!errors.length) {
      try {
        for (const subscription of giftSubscriptions) {
          await createGiftSubscription(subscription);
        }
      } catch (err) {
        errors.push(err.message);
      }
    }

    const result = {
      importStartedAt: startTimeStamp,
      name: 'woo-import-subscriptions',
      result: giftSubscriptions.length
        ? JSON.stringify(`{upserted: ${giftSubscriptions.length}`)
        : null,
      errors: errors?.length ? errors.join() : null,
    };

    await createImportResult(result);

    console.debug(' => DONE');

    return result;
  }

  if (type === 'IMPORT_SUBSCRIPTIONS') {
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
      name: 'woo-import-subscriptions',
      result: subscriptionStats ? JSON.stringify(subscriptionStats) : null,
      errors: errors?.length ? errors.join() : null,
    };

    await createImportResult(result);

    console.debug(`=> DONE (${subscriptions.length} fetched)`);

    return result;
  }
}
