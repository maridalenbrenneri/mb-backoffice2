import * as subscriptionRepository from '~/_libs/core/repositories/subscription';
import * as orderRepository from '~/_libs/core/repositories/order';

import { OrderStatus, OrderType } from '~/_libs/core/repositories/order';

import { fetchOrders } from './orders/fetch';
import { getNextOrCreateDelivery } from '../core/services/delivery-service';
import type { OrderInfo } from './orders/woo-api-to-order';
import wooApiToOrderInfo, {
  hasSupportedStatus,
} from './orders/woo-api-to-order';
import {
  WOO_NON_RECURRENT_SUBSCRIPTION_ID,
  WOO_RENEWALS_SUBSCRIPTION_ID,
} from '../core/settings';
import orderUpdateStatus from './order-update-status';
import { WOO_STATUS_COMPLETED } from './constants';
import { type WooOrder } from './orders/types';
import { getAllProducts } from '../core/repositories/product';
import { SubscriptionType } from '~/_libs/core/repositories/subscription';

async function resolveSubscription(info: OrderInfo) {
  if (!info.wooCustomerId) {
    // ORDER PLACED AS "GUEST" IN VIEW. CANNOT BE SUBSCRIPTION RENEWAL.
    return WOO_NON_RECURRENT_SUBSCRIPTION_ID;
  }

  const subscription = await subscriptionRepository.getSubscription({
    where: {
      type: SubscriptionType.PRIVATE, // This is needed because orders with gift subscriptions ordered by an owner of a subscription will have same customer id
      wooCustomerId: info.wooCustomerId,
    },
    select: {
      id: true,
    },
  });

  if (!subscription) {
    if (info.wooCreatedVia === 'subscription') {
      console.warn(
        `No subscription was found for Woo renewal order. Woo order id: ${info.order.id} ${info.wooCustomerId}. Order is added to default system renewal subscription.`
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

  let wooOrders: WooOrder[] = [];
  const ordersWithUnknownProduct: number[] = [];

  const allWooOrders = await fetchOrders();

  wooOrders = allWooOrders.filter((order) => hasSupportedStatus(order));

  console.debug(`=> DONE (${wooOrders.length} fetched)`);

  const nextDelivery = await getNextOrCreateDelivery();
  const products = await getAllProducts();

  const findProductByWooProductId = (wooProductId: number) => {
    const product = products.find((c) => c.wooProductId === wooProductId);
    return product?.id;
  };

  const verifyThatItemsAreValid = (items: any[], wooOrderId: number) => {
    if (items.some((i) => !findProductByWooProductId(i.wooProductId))) {
      console.warn(
        `[woo-import-orders] Order contained item with product not existing in Backoffice product code, import will ignore order. Woo order id: ${wooOrderId}`
      );
      ordersWithUnknownProduct.push(wooOrderId);
      return false;
    }

    return true;
  };

  const orderInfos: OrderInfo[] = [];
  for (const wooOrder of wooOrders) {
    const info = await wooApiToOrderInfo(wooOrder);
    orderInfos.push(info);
  }

  console.debug(
    'Orders from Woo, ACTIVE COUNT',
    orderInfos.filter((o) => o.order.status === OrderStatus.ACTIVE).length
  );

  console.debug(
    'Orders from Woo, NON-ACTIVE COUNT',
    orderInfos.filter((o) => o.order.status !== OrderStatus.ACTIVE).length
  );

  let created = 0;
  let updated = 0;
  let notChanged = 0;
  let ignored = 0;

  for (const info of orderInfos) {
    // GIFT SUBSCRIPTIONS
    for (const gift of info.gifts) {
      let exists = await subscriptionRepository.getSubscription({
        where: {
          gift_wooOrderLineItemId: gift.gift_wooOrderLineItemId,
        },
      });

      if (info.order.status === OrderStatus.CANCELLED && exists) {
        await subscriptionRepository.updateStatusOnSubscription(
          exists.id,
          subscriptionRepository.SubscriptionStatus.DELETED
        );
        updated++;
      }

      if (!exists) {
        await subscriptionRepository.createGiftSubscriptionFromWoo(gift);
        created++;
      }

      // Set order to complete in Woo after import, don't if order has other items as well
      if (!info.items.length && info.order.status === OrderStatus.ACTIVE) {
        console.debug(
          'Imported order with nothing but gift subscription, completing order in Woo',
          info.order.wooOrderId
        );
        await orderUpdateStatus(
          info.order.wooOrderId as number,
          WOO_STATUS_COMPLETED
        );
      }
    }

    // SUBSCRIPTION RENEWALS
    if (info.order.type === OrderType.RENEWAL) {
      info.order.subscriptionId = await resolveSubscription(info);
      info.order.deliveryId = nextDelivery.id;

      let res = await orderRepository.upsertOrderFromWoo(
        info.order.wooOrderId as number,
        info.order
      );

      if (res.result === 'new') created++;
      else if (res.result === 'updated') updated++;

      // SINGLE ORDERS (IF ONLY GIFT, ITEMS IS EMPTY, ALREADY HANDLED ABOVE)
    } else if (info.items.length) {
      if (!verifyThatItemsAreValid(info.items, info.order.wooOrderId as number))
        continue;

      // ALL WOO SINGLE ORDERS ENDS UP ON DEFAULT SYSTEM SUBSCRIPTION
      info.order.subscriptionId = WOO_NON_RECURRENT_SUBSCRIPTION_ID;
      info.order.deliveryId = nextDelivery.id;

      let res = await orderRepository.upsertOrderFromWoo(
        info.order.wooOrderId as number,
        info.order
      );

      if (res.result === 'new') {
        for (const item of info.items) {
          const productId = findProductByWooProductId(item.wooProductId);
          if (!productId) {
            throw new Error(
              'Product not found, should never happen, order has been verified'
            );
          }
          await orderRepository.upsertOrderItemFromWoo(item.wooOrderItemId, {
            orderId: res.orderId,
            productId: productId as number,
            variation: '_250',
            quantity: item.quantity,
          });

          console.debug('ORDER ITEM', productId, item.wooProductId);
        }

        created++;
      } else if (res.result === 'updated') {
        updated++;
      } else if (res.result === 'notChanged') {
        notChanged++;
      } else {
        // IF ORDER IS IGNORED IT'S LIKELY ALREADY COMPLETED IN WOO AND NOT PREVIOUSLY IMPORTED
        ignored++;
      }
    }
  }

  return {
    created,
    updated,
    notChanged,
    ignored,
    ordersWithUnknownProduct,
  };
}
