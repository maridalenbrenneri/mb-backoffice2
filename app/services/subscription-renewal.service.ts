import { DateTime } from 'luxon';
import { In } from 'typeorm';
import { createOrders } from '~/services/order.service';

import {
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
  ShippingType,
  OrderType,
  OrderStatus,
} from '~/services/entities/enums';

import { SUBSCRIPTION_RENEWAL_WEEKDAY, TAKE_MAX_ROWS } from '../settings';
import { getNextOrCreateDelivery } from '~/services/delivery.service';
import { getSubscriptions } from '~/services/subscription.service';

function isTimeToCreateRenewalOrders() {
  return DateTime.now().weekday === SUBSCRIPTION_RENEWAL_WEEKDAY;
}

// B2B MONTHTLY_3RD AND FORTNIGHTLY
async function getActiveSubscriptions3RD() {
  return await getSubscriptions({
    where: {
      type: SubscriptionType.B2B,
      status: SubscriptionStatus.ACTIVE,
      frequency: In([
        SubscriptionFrequency.FORTNIGHTLY,
        SubscriptionFrequency.MONTHLY_3RD,
      ]),
    },
    relations: ['orders'],
    take: TAKE_MAX_ROWS,
  });
}

// GET MONTHLY AND B2B FORTNIGHTLY
async function getActiveSubscriptionsMonthly() {
  // Get PRIVATE_GIFT subscriptions with MONTHLY frequency
  const privateGiftSubscriptions = await getSubscriptions({
    where: {
      type: SubscriptionType.PRIVATE_GIFT,
      frequency: SubscriptionFrequency.MONTHLY,
      status: SubscriptionStatus.ACTIVE,
    },
    relations: ['orders'],
    take: TAKE_MAX_ROWS,
  });

  // Get B2B subscriptions with MONTHLY or FORTNIGHTLY frequency
  const b2bSubscriptions = await getSubscriptions({
    where: {
      type: SubscriptionType.B2B,
      frequency: In([
        SubscriptionFrequency.MONTHLY,
        SubscriptionFrequency.FORTNIGHTLY,
      ]),
      status: SubscriptionStatus.ACTIVE,
    },
    relations: ['orders'],
    take: TAKE_MAX_ROWS,
  });

  // Combine the results
  return [...privateGiftSubscriptions, ...b2bSubscriptions];
}

export async function createRenewalOrders(ignoreRenewalDay: boolean = false) {
  if (!ignoreRenewalDay && !isTimeToCreateRenewalOrders())
    return 'Today is not the weekday for creating renewal orders';

  const delivery = await getNextOrCreateDelivery();

  if (delivery.type === 'NORMAL') {
    return { result: 'Next Delivery is not a subscription delivery' };
  }

  let subscriptions;

  if (delivery.type === 'MONTHLY') {
    subscriptions = await getActiveSubscriptionsMonthly();
  } else if (delivery.type === 'MONTHLY_3RD') {
    subscriptions = await getActiveSubscriptions3RD();
  }

  if (!subscriptions) {
    throw new Error(
      'Unknown Delivery Type on next Delivery, cannot resolve if renewal orders should be created'
    );
  }

  // EXCLUDE ALL SUBSCRIPTIONS THAT ALREADY HAS A RECURRENT ORDER ON CURRENT DELIVERY
  const subscriptionsToCreateOrderOn = subscriptions.filter((s: any) => {
    return !s.orders.some((order: any) => order.deliveryId === delivery.id);
  });

  const newOrders = subscriptionsToCreateOrderOn.map((s: any) => {
    return {
      status: OrderStatus.ACTIVE,
      type: OrderType.RENEWAL,
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
