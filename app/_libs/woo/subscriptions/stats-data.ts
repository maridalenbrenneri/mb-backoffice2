import type { Subscription } from '~/_libs/core/models/subscription.server';
import {
  SubscriptionFrequency,
  SubscriptionStatus,
} from '~/_libs/core/models/subscription.server';
import type { SubscriptionStats } from '~/_libs/core/services/subscription-stats';
import { countBags } from '~/_libs/core/services/subscription-stats';

export default function resolveSubscriptionData(
  subscriptions: Subscription[]
): SubscriptionStats {
  const activeAbos = subscriptions.filter(
    (s) => s.status === SubscriptionStatus.ACTIVE
  );

  const monthly = activeAbos.filter(
    (s) => s.frequency === SubscriptionFrequency.MONTHLY
  );

  const fortnightly = activeAbos.filter(
    (s) => s.frequency === SubscriptionFrequency.FORTNIGHTLY
  );

  const bagCounterMonthly = countBags(monthly);
  const bagCounterFortnightly = countBags(fortnightly);

  return {
    totalCount: activeAbos.length,
    subscriptionCount: activeAbos.length,
    giftSubscriptionCount: 0,
    b2bSubscriptionCount: 0,
    fortnightlyCount: fortnightly.length,
    monthlyCount: monthly.length,
    bagCounterMonthly,
    bagCounterFortnightly,
  };
}
