import {
  ShippingType,
  OrderStatus,
  OrderType,
  SubscriptionType,
} from '@prisma/client';
import { DateTime } from 'luxon';
import { createOrders } from '../models/order.server';
import {
  getSubscriptions,
  SubscriptionFrequency,
  SubscriptionStatus,
} from '../models/subscription.server';
import { SUBSCRIPTION_RENEWAL_WEEKDAY, TAKE_MAX_ROWS } from '../settings';
import { getNextOrCreateDelivery } from './delivery-service';

function isTimeToCreateRenewalOrders() {
  return DateTime.now().weekday === SUBSCRIPTION_RENEWAL_WEEKDAY;
}

async function getActiveSubscriptions(frequency: SubscriptionFrequency) {
  return await getSubscriptions({
    where: {
      type: {
        in: [SubscriptionType.B2B, SubscriptionType.PRIVATE_GIFT],
      },
      status: SubscriptionStatus.ACTIVE,
      frequency,
    },
    include: {
      orders: {
        where: {
          type: OrderType.RECURRING,
        },
        select: {
          createdAt: true,
          deliveryId: true,
        },
      },
    },
    take: TAKE_MAX_ROWS,
  });
}

export async function createRenewalOrders() {
  if (!isTimeToCreateRenewalOrders())
    return 'Today is not the weekday for creating renewal orders';

  const delivery = await getNextOrCreateDelivery();

  if (delivery.type === 'NORMAL') {
    return { result: 'Next Delivery is not a subscription delivery' };
  }

  let subscriptions;

  if (delivery.type === 'MONTHLY') {
    subscriptions = await getActiveSubscriptions(SubscriptionFrequency.MONTHLY);
  } else if (delivery.type === 'FORTNIGHTLY') {
    subscriptions = await getActiveSubscriptions(
      SubscriptionFrequency.FORTNIGHTLY
    );
  } else if (delivery.type === 'MONTHLY_3RD') {
    subscriptions = await getActiveSubscriptions(
      SubscriptionFrequency.MONTHLY_3RD
    );
  }

  if (!subscriptions) {
    throw new Error(
      'Unknown Delivery Type on next Delivery, cannot resolve if renewal orders should be created'
    );
  }

  // EXCLUDE ALL SUBSCRIPTIONS THAT ALREADY HAS A RECURRENT ORDER ON CURRENT DELIVERY
  const subscriptionsToCreateOrderOn = subscriptions.filter((s) => {
    return !s.orders.some((order: any) => order.deliveryId === delivery.id);
  });

  const newOrders = subscriptionsToCreateOrderOn.map((s: any) => {
    return {
      status: OrderStatus.ACTIVE,
      type: OrderType.RECURRING,
      shippingType: s.shippingType || ShippingType.SHIP,
      subscriptionId: s.id,
      deliveryId: delivery.id,
      name: s.recipientName,
      address1: s.recipientAddress1,
      address2: s.recipientAddress2,
      postalCode: s.recipientPostalCode,
      postalPlace: s.recipientPostalPlace,
      email: s.recipientEmail,
      mobile: s.recipientMobile,
      quantity250: s.quantity250 || 0,
      quantity500: s.quantity500 || 0,
      quantity1200: s.quantity1200 || 0,
    };
  });

  const result = await createOrders(newOrders);

  console.debug('Created renewal order(s) for subscriptions', result);

  return `${newOrders.length} renewal order(s) were created`;
}
