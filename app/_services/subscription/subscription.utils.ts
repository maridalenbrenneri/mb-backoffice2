import { DateTime } from 'luxon';

import {
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '~/_libs/core/repositories/subscription';
import {
  SubscriptionEntity,
  SubscriptionSpecialRequest,
} from './subscription-entity';
import { getNextFirstTuesday } from '~/_libs/core/utils/dates';

function calculateSubscriptionWeight(subscription: SubscriptionEntity) {
  let weight = 0;

  if (subscription.quantity250) weight += subscription.quantity250 * 250;
  if (subscription.quantity500) weight += subscription.quantity500 * 500;
  if (subscription.quantity1200) weight += subscription.quantity1200 * 1200;

  return weight / 1000;
}

export function resolveSpecialRequestCode(
  specialRequest: SubscriptionSpecialRequest
) {
  switch (specialRequest) {
    case SubscriptionSpecialRequest.TWO_COFFEE_TYPES:
      return '__R2';
    case SubscriptionSpecialRequest.NO_DRY_PROCESSED:
      return '__R5';
    case SubscriptionSpecialRequest.ONLY_DRY_PROCESSED:
      return '__R6';
    default:
      return '';
  }
}

export function resolveSubscriptionCode(subscription: SubscriptionEntity) {
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
  const first = firstDeliveryDate.startOf('month');

  const last = first.plus({ months: durationMonths - 1 }).plus({ days: 7 });

  const today = DateTime.now().startOf('day');

  const nextMonthly = getNextFirstTuesday(today);

  if (today > last) return SubscriptionStatus.COMPLETED;

  if (first > nextMonthly) return SubscriptionStatus.NOT_STARTED;

  return SubscriptionStatus.ACTIVE;
}
