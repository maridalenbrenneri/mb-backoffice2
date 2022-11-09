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

  const bagCounter = countBags(activeAbos);

  const fortnightlyCount = activeAbos.filter(
    (s) => s.frequency === SubscriptionFrequency.FORTNIGHTLY
  ).length;

  const monthlyCount = activeAbos.filter(
    (s) => s.frequency === SubscriptionFrequency.MONTHLY
  ).length;

  return {
    totalCount: activeAbos.length,
    subscriptionCount: activeAbos.length,
    giftSubscriptionCount: 0,
    fortnightlyCount,
    monthlyCount: monthlyCount,
    bagCounter,
  };
}
