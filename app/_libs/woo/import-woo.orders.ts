import { fetchOrders } from './orders/fetch';
import {
  createGiftSubscription,
  getSubscription,
} from '../core/models/subscription.server';
import {
  upsertOrderFromWoo,
  upsertOrderItemFromWoo,
} from '../core/models/order.server';
import { getNextOrCreateDelivery } from '../core/services/delivery-service';
import wooApiToOrder, { hasSupportedStatus } from './orders/woo-api-to-order';
import {
  WOO_NON_RECURRENT_SUBSCRIPTION_ID,
  WOO_RENEWALS_SUBSCRIPTION_ID,
} from '../core/settings';
import { getCoffees } from '../core/models/coffee.server';
import { OrderStatus, OrderType, SubscriptionStatus } from '@prisma/client';

async function resolveSubscription(wooOrder: any) {
  // console.debug('Resolving subscription for order', wooOrder.wooOrderId);
  if (!wooOrder.wooCustomerId) {
    // ORDER PLACED AS "GUEST" IN VIEW. CANNOT BE SUBSCRIPTION RENEWAL.
    return WOO_NON_RECURRENT_SUBSCRIPTION_ID;
  }

  const subscription = await getSubscription({
    where: {
      AND: [
        {
          wooCustomerId: wooOrder.wooCustomerId,
        },
        {
          status: SubscriptionStatus.ACTIVE,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!subscription) {
    if (wooOrder.created_via === 'subscription') {
      console.warn(
        `No subscription was found for Woo renewal order. Woo order id: ${wooOrder.wooOrderId}. Order is added to default system renewal subscription.`
      );
      return WOO_RENEWALS_SUBSCRIPTION_ID;
    }

    // NON RENEWAL ORDER ON A CUSTOMER THAT HASN'T A SUBSCRIPTION IN BACKOFFICE, RETURN DEFAULT NON RECURRENT SYSTEM SUBSCRIPTION
    return WOO_NON_RECURRENT_SUBSCRIPTION_ID;
  }

  // console.debug('Resolved subscription', subscription.id);
  return subscription.id;
}

export default async function importWooOrders() {
  console.debug('FETCHING WOO ORDERS...');

  let wooOrders: any[] = [];
  const ordersNotImported: number[] = [];
  let ordersUpsertedCount = 0;

  const allWooOrders = await fetchOrders();

  wooOrders = allWooOrders.filter((order) => hasSupportedStatus(order));

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
    const mapped = await wooApiToOrder(wooOrder);
    orderInfos.push(mapped);
  }

  console.debug(
    'Orders from Woo, ACTIVE COUNT',
    orderInfos.filter((o) => o.order.status === OrderStatus.ACTIVE).length
  );

  console.debug(
    'Orders from Woo, NON-ACTIVE COUNT',
    orderInfos.filter((o) => o.order.status !== OrderStatus.ACTIVE).length
  );

  for (const info of orderInfos) {
    let included = false;

    // GIFT SUBSCRIPTIONS
    if (info.gifts.length)
      console.debug(
        `Creating ${info.gifts.length} gift subscription(s) from Woo order ${info.order.wooOrderId}`
      );
    for (const gift of info.gifts) {
      await createGiftSubscription(gift);
      // TODO: Set order to complete in Woo when imported. OBS: Handle if order has other items!
      included = true;
    }

    // SUBSCRIPTION RENEWALS
    if (info.order.type === OrderType.RECURRING) {
      info.order.subscriptionId = await resolveSubscription(info.order);
      info.order.deliveryId = nextDelivery.id;

      await upsertOrderFromWoo(info.order.wooOrderId as number, info.order);

      included = true;

      // SINGLE ORDERS (IF ONLY GIFT, ITEMS IS EMPTY, ALREADY HANDLED ABOVE)
    } else if (info.items.length) {
      if (!verifyThatItemsAreValid(info.items, info.order.wooOrderId)) continue;

      // ALL WOO SINGLE ORDERS ENDS UP ON DEFAULT SYSTEM SUBSCRIPTION
      info.order.subscriptionId = WOO_NON_RECURRENT_SUBSCRIPTION_ID;
      info.order.deliveryId = nextDelivery.id;

      const orderCreated = await upsertOrderFromWoo(
        info.order.wooOrderId as number,
        info.order
      );

      // IF ORDER NOT CREATED IT'S LIKELY A COMLETED ORDER NOT PREVIOSLY IMPORTED, SHOULD BE IGNORED
      if (orderCreated) {
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
        included = true;
      }
    }

    if (included) ordersUpsertedCount++;
  }

  return {
    ordersUpsertedCount,
    ordersNotImported,
  };
}
