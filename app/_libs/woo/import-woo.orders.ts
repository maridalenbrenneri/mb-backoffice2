import { fetchOrders } from './orders/fetch';
import { createGiftSubscription } from '../core/models/subscription.server';
import {
  upsertOrderFromWoo,
  upsertOrderItemFromWoo,
} from '../core/models/order.server';
import { getNextOrCreateDelivery } from '../core/services/delivery-service';
import wooApiToOrder from './orders/woo-api-to-order';
import { WOO_RENEWALS_SUBSCRIPTION_ID } from '../core/settings';
import { getCoffees } from '../core/models/coffee.server';

export default async function importWooOrders() {
  console.debug('FETCHING WOO ORDERS...');

  let wooOrders: any[] = [];
  const ordersNotImported: number[] = [];
  let ordersUpsertedCount = 0;

  wooOrders = await fetchOrders();

  console.debug(`=> DONE (${wooOrders.length} fetched)`);

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
      if (!verifyThatItemsAreValid(info.items, info.order.wooOrderId)) continue;

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

  return {
    ordersUpsertedCount,
    ordersNotImported,
  };
}
