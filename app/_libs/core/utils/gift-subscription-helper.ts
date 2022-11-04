import type { Subscription } from '@prisma/client';
import {
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';
import { DateTime } from 'luxon';

import { resolveNextDeliveryDay } from './dates';

export function resolveSubscriptionCode(subscription: Subscription) {
  const getType = (type: SubscriptionType) => {
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

  const type = getType(subscription.type);
  const freq =
    subscription.frequency === SubscriptionFrequency.FORTNIGHTLY ? '2' : '1';
  const quantity = subscription.quantity250; // TODO

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
