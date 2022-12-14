import { DateTime } from 'luxon';

import type { Subscription } from '@prisma/client';
import {
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';
import {
  getSubscriptions,
  updateStatusOnSubscription,
} from '../models/subscription.server';
import { TAKE_MAX_ROWS } from '../settings';
import { resolveDateForNextMonthlyDelivery } from '../utils/dates';

function calculateSubscriptionWeight(subscription: Subscription) {
  let weight = 0;

  if (subscription.quantity250) weight += subscription.quantity250 * 250;
  if (subscription.quantity500) weight += subscription.quantity500 * 500;
  if (subscription.quantity1200) weight += subscription.quantity1200 * 1200;

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

// TODO: RESOLVE COMPLETED STATUS FROM ORDERS COMPLETED INSTEAD OF DATE (CANNOT BE DONE UNTIL ALL ACTIVE GABOS HAVE BEEN IMPORTED FROM THE START)
export function resolveStatusForGiftSubscription(
  durationMonths: number,
  firstDeliveryDate: DateTime
): SubscriptionStatus {
  const first = firstDeliveryDate.startOf('day');

  const last = first
    .plus({ months: durationMonths })
    .startOf('month')
    .plus({ days: 7 });

  const today = DateTime.now().startOf('day');

  const nextMonthly = resolveDateForNextMonthlyDelivery();

  if (today > last) return SubscriptionStatus.COMPLETED;

  if (first > nextMonthly) return SubscriptionStatus.NOT_STARTED;

  return SubscriptionStatus.ACTIVE;
}

export async function updateStatusOnGiftSubscriptions() {
  const gifts = await getSubscriptions({
    where: {
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.NOT_STARTED],
      },
      type: SubscriptionType.PRIVATE_GIFT,
    },
    select: {
      id: true,
      status: true,
      gift_durationMonths: true,
      gift_firstDeliveryDate: true,
    },
    take: TAKE_MAX_ROWS,
  });

  let updatedCount = 0;

  console.debug(`Checking status on ${gifts.length} gift subscriptions`);

  for (const gift of gifts) {
    const duration = gift.gift_durationMonths as number;
    const date = DateTime.fromISO(
      (gift.gift_firstDeliveryDate as Date).toISOString()
    );

    const status = resolveStatusForGiftSubscription(duration, date);

    if (gift.status !== status) {
      console.debug(
        `Detected new status for gift subscription ${gift.id}. Updating from ${gift.status} to ${status}`
      );
      await updateStatusOnSubscription(gift.id, status);
      updatedCount++;
    }
  }

  return { updatedCount };
}
