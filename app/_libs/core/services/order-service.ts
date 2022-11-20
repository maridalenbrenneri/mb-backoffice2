import type { Order } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { OrderType } from '@prisma/client';
import { redirect } from '@remix-run/node';

import { sendConsignment } from '~/_libs/cargonizer';
import { getOrder, upsertOrder } from '../models/order.server';
import { getSubscription } from '../models/subscription.server';
import { WEIGHT_STANDARD_PACKAGING } from '../settings';
import { getNextDelivery } from './delivery-service';

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
  const subscription = await getSubscription(subscriptionId);

  if (!subscription) {
    console.warn(
      `[order-service] The subscription was not found, cannot create order. Subscription id: ${subscriptionId}`
    );
    throw new Error('Failed to create order, subscription was not found');
  }

  if (type !== OrderType.CUSTOMIZED && !quantities) {
    // DEFAULT TO SUBSCRIPTION QUANTITIES
    quantities = {
      _250: subscription.quantity250,
      _500: subscription.quantity500,
      _1200: subscription.quantity1200,
    };
  }

  const delivery = await getNextDelivery();

  const order = await upsertOrder(null, {
    wooOrderId: null,
    subscriptionId,
    deliveryId: delivery.id,
    status: OrderStatus.ACTIVE,
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
  await _createOrder(subscriptionId, OrderType.NON_RECURRING, quantities);
  return redirect(`/subscriptions/admin/${subscriptionId}`);
}

export async function createCustomizedOrder(subscriptionId: number) {
  const order = await _createOrder(subscriptionId, OrderType.CUSTOMIZED);
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

export function generateReference(order: Order) {
  let reference = '';

  for (const item of order.orderItems) {
    reference = `${reference} ${item.quantity}${item.mbProductCode}`;
  }

  if (order.quantity250)
    reference = `${reference} ${order.quantity250}${'TEST'}`;

  if (order.quantity500)
    reference = `${reference} ${order.quantity500}${'TEST'}-500gr`;

  if (order.quantity1200)
    reference = `${reference} ${order.quantity1200}${'TEST'}-1,2kg`;

  return reference;
}

export async function shipOrder(orderId: number) {
  const order = await getOrder(orderId);

  if (!order) {
    console.warn(
      `[order-service] The order requested to be sent was not found, order id: ${orderId}`
    );
    return;
  }

  return await sendConsignment({
    order,
    print: true,
  });
}
