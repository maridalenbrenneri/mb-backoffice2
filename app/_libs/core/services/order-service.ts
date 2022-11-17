import type { Delivery, Order, Subscription } from '@prisma/client';
import { SubscriptionType, OrderType } from '@prisma/client';
import { sendConsignment } from '~/_libs/cargonizer';
import { getOrder } from '../models/order.server';

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
