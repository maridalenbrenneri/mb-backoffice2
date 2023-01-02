import type { Order } from '@prisma/client';
import { SubscriptionType } from '@prisma/client';
import { ShippingType } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { OrderType } from '@prisma/client';
import { redirect } from '@remix-run/node';

import { sendConsignment } from '~/_libs/cargonizer';
import type { OrderUpsertData } from '../models/order.server';
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
  } as OrderUpsertData);

  if (!order) throw new Error('Failed to create order');

  return order;
}

export async function createNonRecurringOrder(
  subscriptionId: number,
  quantities: Quantites
) {
  await _createOrder(subscriptionId, OrderType.NON_RENEWAL, quantities);
  return redirect(`/subscriptions/admin/${subscriptionId}`);
}

export async function createCustomdOrder(subscriptionId: number) {
  const order = await _createOrder(subscriptionId, OrderType.CUSTOM);
  return redirect(`/orders/admin/${order.id}`);
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
async function completeAndShipOrder(orderId: number) {
  let genericError;
  let cargonizer;
  let wooResult;

  try {
    const order = await getOrderFromDb(orderId);

    if (!order) {
      console.warn(
        `[order-service] The order requested to be sent was not found, order id: ${orderId}`
      );
      return;
    }

    if (order.shippingType !== ShippingType.LOCAL_PICK_UP) {
      cargonizer = await sendConsignment({
        order,
        print: true,
      });
    }

    if (order.wooOrderId) {
      wooResult = await woo.updateStatus(
        order.wooOrderId,
        WOO_STATUS_COMPLETED
      );
    }

    await updateOrderStatus(order.id, OrderStatus.COMPLETED);
  } catch (err) {
    genericError = err.message;
  }

  const errors: string[] = [];
  if (genericError) errors.push(genericError);
  if (wooResult?.error) errors.push(wooResult.error);
  if (cargonizer?.error) errors.push(cargonizer.error);

  const printOk =
    !cargonizer?.printRequested ||
    (cargonizer?.printRequested && !cargonizer?.error);
  const wooOk = !wooResult?.error;

  const result = !genericError && wooOk && printOk ? 'Success' : 'Failed';

  return {
    result,
    orderId,
    errors,
    printed: cargonizer?.printRequested || false,
    printError: cargonizer?.error || null,
    wooOrderId: wooResult?.orderId || null,
    wooOrderStatus: wooResult?.orderStatus || null,
    wooError: wooResult?.error || null,
  };
}

export async function completeAndShipOrders(orderIds: number[]) {
  if (!orderIds.length) return [];

  const delay = () =>
    new Promise((resolve) => setTimeout(resolve, COMPLETE_ORDERS_DELAY));

  const result: any[] = [];

  for (const orderId of orderIds) {
    const res = await completeAndShipOrder(orderId);
    result.push(res);

    await delay();
  }

  console.table(result);

  return result;
}

export async function completeOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.updateStatus(order.wooOrderId, WOO_STATUS_COMPLETED);
  }
  await updateOrderStatus(order.id, OrderStatus.COMPLETED);
  return null;
}

export async function cancelOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.updateStatus(order.wooOrderId, WOO_STATUS_CANCELLED);
  }
  await updateOrderStatus(order.id, OrderStatus.CANCELLED);
  return null;
}

export async function activateOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.updateStatus(order.wooOrderId, WOO_STATUS_PROCESSING);
  }
  await updateOrderStatus(order.id, OrderStatus.ACTIVE);
  return null;
}
