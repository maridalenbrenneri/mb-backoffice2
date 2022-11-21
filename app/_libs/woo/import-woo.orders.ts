import { DateTime } from 'luxon';

import { fetchOrders } from './orders/fetch';
import { createGiftSubscription } from '../core/models/subscription.server';
import { createImportResult } from '../core/models/import-result.server';
import {
  upsertOrderFromWoo,
  upsertOrderItemFromWoo,
} from '../core/models/order.server';
import { getNextOrCreateDelivery } from '../core/services/delivery-service';
import wooApiToOrder from './orders/woo-api-to-order';
import { WOO_RENEWALS_SUBSCRIPTION_ID } from '../core/settings';
import { getCoffees } from '../core/models/coffee.server';

export default async function importWooOrders() {
  const startTimeStamp = DateTime.now().toJSDate();

  console.debug('FETCHING WOO ORDERS...');

  const errors: Error[] = [];
  let wooOrders: any[] = [];
  const ordersNotImported: number[] = [];
  let ordersUpsertedCount = 0;

  try {
    wooOrders = await fetchOrders();
  } catch (err) {
    errors.push(err);
  }

  console.debug(`=> DONE (${wooOrders.length} fetched)`);

  if (!errors.length) {
    const nextDelivery = await getNextOrCreateDelivery();
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
      const orderInfos: any[] = [];
      for (const wooOrder of wooOrders) {
        const mapped = await wooApiToOrder(
          wooOrder,
          WOO_RENEWALS_SUBSCRIPTION_ID,
          nextDelivery.id
        );
        orderInfos.push(mapped);
      }

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
