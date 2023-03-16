import type { Order } from '@prisma/client';
import { SubscriptionType } from '@prisma/client';
import { ShippingType } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { OrderType } from '@prisma/client';

import { printConsignmentLabels, sendConsignment } from '~/_libs/cargonizer';
import { updateOrder } from '../models/order.server';
import { updateOrderStatus } from '../models/order.server';
import { getOrder, upsertOrder } from '../models/order.server';
import { getSubscription } from '../models/subscription.server';
import { COMPLETE_ORDERS_DELAY, WEIGHT_STANDARD_PACKAGING } from '../settings';
import { getNextOrCreateDelivery } from './delivery-service';

import * as woo from '~/_libs/woo';
import {
  WOO_STATUS_CANCELLED,
  WOO_STATUS_COMPLETED,
  WOO_STATUS_PROCESSING,
} from '~/_libs/woo/constants';
import { resolveSpecialRequestCode } from './subscription-service';

export interface Quantites {
  _250: number;
  _500: number;
  _1200: number;
}

async function _createOrder(
  subscriptionId: number,
  type: OrderType,
  quantities: Quantites | null = {
    _250: 0,
    _500: 0,
    _1200: 0,
  }
): Promise<Order> {
  const subscription = await getSubscription({
    where: { id: subscriptionId },
    include: {
      orders: {
        include: {
          delivery: true,
          orderItems: true,
        },
      },
    },
  });

  if (!subscription) {
    console.warn(
      `[order-service] The subscription was not found, cannot create order. Subscription id: ${subscriptionId}`
    );
    throw new Error('Failed to create order, subscription was not found');
  }

  if (type !== OrderType.CUSTOM && !quantities) {
    // DEFAULT TO SUBSCRIPTION QUANTITIES
    quantities = {
      _250: subscription.quantity250,
      _500: subscription.quantity500,
      _1200: subscription.quantity1200,
    };
  }

  const delivery = await getNextOrCreateDelivery();

  const order = await upsertOrder(null, {
    subscriptionId,
    deliveryId: delivery.id,
    status: OrderStatus.ACTIVE,
    shippingType: subscription.shippingType,
    type,
    name: subscription.recipientName,
    address1: subscription.recipientAddress1,
    address2: subscription.recipientAddress2,
    postalCode: subscription.recipientPostalCode,
    postalPlace: subscription.recipientPostalPlace,
    email: subscription.recipientEmail,
    mobile: subscription.recipientMobile,
    quantity250: quantities?._250 || 0,
    quantity500: quantities?._500 || 0,
    quantity1200: quantities?._1200 || 0,
  });

  if (!order) throw new Error('Failed to create order');

  return order;
}

export async function createNonRecurringOrder(
  subscriptionId: number,
  quantities: Quantites
) {
  return await _createOrder(subscriptionId, OrderType.NON_RENEWAL, quantities);
}

export async function createCustomOrder(subscriptionId: number) {
  return await _createOrder(subscriptionId, OrderType.CUSTOM);
}

export function calculateWeight(
  order: Order,
  includePackaging: boolean = true
) {
  let weight = 0;

  for (const item of order.orderItems) {
    if (item.variation === '_250') weight += 250 * item.quantity;
    if (item.variation === '_500') weight += 500 * item.quantity;
    if (item.variation === '_1200') weight += 1200 * item.quantity;
  }

  if (order.quantity250) weight += 250 * order.quantity250;
  if (order.quantity500) weight += 500 * order.quantity500;
  if (order.quantity1200) weight += 1200 * order.quantity1200;

  if (includePackaging) weight += WEIGHT_STANDARD_PACKAGING;

  return weight;
}

export function resolveSource(order: Order) {
  if (order.wooOrderId) return `woo`;

  if (order.subscription?.type === SubscriptionType.B2B) return 'b2b';
  if (order.subscription?.type === SubscriptionType.PRIVATE_GIFT) return 'gabo';

  return 'n/a';
}

export function generateReference(order: Order) {
  let reference = '';

  if (order.orderItems) {
    for (const item of order.orderItems) {
      if (item.variation === '_250')
        reference = `${reference} ${item.quantity}${item.coffee.productCode}`;
      if (item.variation === '_500')
        reference = `${reference} ${item.quantity}${item.coffee.productCode}x500g`;
      if (item.variation === '_1200')
        reference = `${reference} ${item.quantity}${item.coffee.productCode}x1.2kg`;
    }
  }

  if (order.quantity250) reference = `${reference} ABO${order.quantity250}`;

  if (order.quantity500)
    reference = `${reference} ABO${order.quantity500}x500g`;

  if (order.quantity1200)
    reference = `${reference} ABO${order.quantity1200}x1,2kg`;

  if (order.subscription?.specialRequest)
    reference = `${reference} ${resolveSpecialRequestCode(
      order.subscription.specialRequest
    )}`;

  return reference;
}

async function getOrderFromDb(orderId: number) {
  return await getOrder({
    where: {
      id: orderId,
    },
    include: {
      subscription: true,
      orderItems: {
        include: {
          coffee: true,
        },
      },
    },
  });
}

// COMPLETE IN MB AND WOO, CREATE CONSIGNMENT IN CARGONIZER
async function completeAndShipOrder(orderId: number, results: any[]) {
  let error;
  let cargonizer;
  let wooResult;

  let isCompletedInWoo = false;
  let isTransferedToCargonizer = false;

  try {
    const order = await getOrderFromDb(orderId);

    if (!order) {
      console.warn(
        `[order-service] The order requested to be sent was not found, order id: ${orderId}`
      );
      return;
    }

    if (order.wooOrderId) {
      wooResult = await woo.updateStatus(
        order.wooOrderId,
        WOO_STATUS_COMPLETED
      );

      if (wooResult.error) {
        console.warn(wooResult.error);
        throw new Error('Failed to complete order in Woo');
      }

      isCompletedInWoo = true;
    }

    if (order.shippingType !== ShippingType.LOCAL_PICK_UP) {
      cargonizer = await sendConsignment({
        order,
      });

      if (cargonizer?.error) {
        console.warn(cargonizer.error);
        throw new Error('Failed to create consignment in Cargonizer');
      }

      isTransferedToCargonizer = true;
    }

    await updateOrder(order.id, {
      status: OrderStatus.COMPLETED,
      trackingUrl: cargonizer?.trackingUrl || null,
    });
  } catch (err) {
    error = err.message;
  }

  results.push({
    result: !error ? 'Success' : 'Failed',
    error,
    orderId,
    isCompletedInWoo,
    isTransferedToCargonizer,
    cargonizerConsignmentId: cargonizer?.consignmentId || null,
    cargonizerTrackingUrl: cargonizer?.trackingUrl || null,
    wooOrderId: wooResult?.orderId || null,
    wooOrderStatus: wooResult?.orderStatus || null,
  });
}

export async function completeAndShipOrders(
  orderIds: number[],
  printLabels = false
) {
  const MAX_CONCURRANT_REQUESTS = 10;

  if (!orderIds.length) return [];

  const delay = () =>
    new Promise((resolve) => setTimeout(resolve, COMPLETE_ORDERS_DELAY));

  const result: {
    orderResult: any[];
    printErrors: any;
  } = {
    orderResult: [],
    printErrors: null,
  };

  let promises: Promise<void>[] = [];

  let requestCounter = 1;
  for (const orderId of orderIds) {
    promises.push(completeAndShipOrder(orderId, result.orderResult));

    if (requestCounter >= MAX_CONCURRANT_REQUESTS) {
      await Promise.all(promises);

      promises = [];
      requestCounter = 0;

      await delay();
    }

    requestCounter++;
  }

  // Wait for any remaining requests
  if (promises.length) {
    await Promise.all(promises);
  }

  if (printLabels) {
    const ids = result.orderResult
      .filter((r) => r.result === 'Success' && r.consignmentId)
      .map((r) => r.consignmentId);

    const printResult = await printConsignmentLabels(ids);

    if (printResult.error) {
      result.printErrors = `Error when printing labels. All orders were most likely created as consignments in Cargonizer but print of one or many labels failed. Err message: "${printResult.error}"`;
    }
  }

  console.debug('Errors: ', result.printErrors);
  console.table(result.orderResult);

  return result;
}

export async function completeOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.updateStatus(order.wooOrderId, WOO_STATUS_COMPLETED);
  }
  await updateOrderStatus(order.id, OrderStatus.COMPLETED);
}

export async function cancelOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.updateStatus(order.wooOrderId, WOO_STATUS_CANCELLED);
  }
  await updateOrderStatus(order.id, OrderStatus.CANCELLED);
}

export async function activateOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.updateStatus(order.wooOrderId, WOO_STATUS_PROCESSING);
  }
  await updateOrderStatus(order.id, OrderStatus.ACTIVE);
}
