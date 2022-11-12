import type { Subscription } from '@prisma/client';
import {
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';
import { DateTime } from 'luxon';

import { resolveNextDeliveryDay } from './dates';

export function calculateSubscriptionWeight(subscription: Subscription) {
  let weight = 0;

  if (subscription.quantity250) weight += subscription.quantity250 * 250;
  if (subscription.quantity500) weight += subscription.quantity500 * 500;
  if (subscription.quantity250) weight += subscription.quantity1200 * 1200;

  console.log(subscription);

  return weight / 1000;
}

export function resolveSubscriptionCode(subscription: Subscription) {
  const translateType = (type: SubscriptionType) => {
    switch (type) {
      case SubscriptionType.PRIVATE_GIFT:
        return 'GABO';
      case SubscriptionType.PRIVATE:
        return 'ABO';
      case SubscriptionType.B2B:
        return 'B2B';
      default:
        return 'UNKNOWN';
    }
  };

  const type = translateType(subscription.type);
  const freq =
    subscription.frequency === SubscriptionFrequency.FORTNIGHTLY ? '2' : '1';

  if (subscription.type === SubscriptionType.B2B) {
    return `${type}${freq}-${calculateSubscriptionWeight(subscription)}kg`;
  }

  const quantity = subscription.quantity250;

  return `${type}${freq}-${quantity}`;
}

// TODO: THIS SHOULD USE DELIVERY
export function resolveStatusAndFirstDeliveryDate(
  duration_months: number,
  date?: DateTime
): { firstDeliveryDate: DateTime; status: SubscriptionStatus } {
  date = date || DateTime.now();

  const firstDeliveryDate = resolveNextDeliveryDay(date);

  const last = firstDeliveryDate
    .plus({ months: duration_months })
    .startOf('month')
    .plus({ days: 7 })
    .startOf('day');

  const today = DateTime.now().startOf('day');

  // console.log("TODAY", "LAST", today.toISODate(), last.toISODate());

  const status =
    today <= last ? SubscriptionStatus.ACTIVE : SubscriptionStatus.COMPLETED;

  return {
    firstDeliveryDate,
    status,
  };
}
