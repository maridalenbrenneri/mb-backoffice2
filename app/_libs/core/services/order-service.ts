import type { Delivery, Order, Subscription } from '@prisma/client';
import { SubscriptionType, OrderType } from '@prisma/client';

import { sendConsignment } from '~/_libs/cargonizer';
import { getOrder } from '../models/order.server';
import { WEIGHT_STANDARD_PACKAGING } from '../settings';

export async function createOrder(order: Order) {}

export async function createRecurringOrder(
  subscription: Subscription,
  fikenContact: any,
  delivery: Delivery
) {
  let recipient;
  // if (subscription.type === SubscriptionType.PRIVATE_GIFT) {
  //   recipient = {
  //     name: subscription.giftSubscription.recipientName,
  //     address1: subscription.giftSubscription.recipientAddress1,
  //     address2: subscription.giftSubscription.address2,
  //     postalCode: subscription.giftSubscription.postalCode,
  //     postalPlace: subscription.giftSubscription.postalPlace,
  //   };
  // } else if (subscription.type === SubscriptionType.B2B) {
  //   recipient = {
  //     name: fikenContact.name,
  //     address1: fikenContact.address1,
  //     address2: fikenContact.address2,
  //     postalCode: fikenContact.postalCode,
  //     postalPlace: fikenContact.postalPlace,
  //   };
  // } else {
  //   throw new Error(
  //     'Cannot create re-curring order, invalid subscription type'
  //   );
  // }

  return {
    type: OrderType.RECURRING,
    quantity250: subscription.quantity250,
    quantity500: subscription.quantity500,
    quantity1200: subscription.quantity1200,
    subscriptionId: subscription.id,
    deliveryId: delivery.id,
  };
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

export async function sendOrder(orderId: number) {
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
