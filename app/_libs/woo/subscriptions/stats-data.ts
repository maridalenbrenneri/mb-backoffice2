import type { Subscription } from "~/_libs/core/models/subscription.server";
import {
  SubscriptionStatus,
  SubscriptionFrequency,
} from "~/_libs/core/models/subscription.server";

interface Counter {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
  eight: number;
}

interface BagCounter {
  fortnightly: Counter;
  monthly: Counter;
}

function countBags(subscriptions: Subscription[]) {
  const bagCounter = initBagCounter();

  bagCounter.monthly.one = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    1
  );
  bagCounter.monthly.two = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    2
  );
  bagCounter.monthly.three = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    3
  );
  bagCounter.monthly.four = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    4
  );
  bagCounter.monthly.five = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    5
  );
  bagCounter.monthly.six = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    6
  );
  bagCounter.monthly.seven = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.MONTHLY,
    7
  );

  bagCounter.fortnightly.one = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    1
  );
  bagCounter.fortnightly.two = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    2
  );
  bagCounter.fortnightly.three = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    3
  );
  bagCounter.fortnightly.four = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    4
  );
  bagCounter.fortnightly.five = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    5
  );
  bagCounter.fortnightly.six = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    6
  );
  bagCounter.fortnightly.seven = resolveBagCount(
    subscriptions,
    SubscriptionFrequency.FORTNIGHTLY,
    7
  );

  return bagCounter;
}

function initBagCounter(): BagCounter {
  return {
    fortnightly: {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
      six: 0,
      seven: 0,
      eight: 0,
    },
    monthly: {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
      six: 0,
      seven: 0,
      eight: 0,
    },
  };
}

function resolveBagCount(
  subscriptions: Subscription[],
  frequency: SubscriptionFrequency,
  bagCount: number
) {
  return subscriptions.filter(
    (s) => s.frequency === frequency && s.bagCount250 === bagCount
  ).length;
}

export default function resolveSubscriptionData(subscriptions: Subscription[]) {
  const activeAbos = subscriptions.filter(
    (s) => s.status === SubscriptionStatus.ACTIVE
  );

  const activeCount = activeAbos.length;
  const onHoldCount = subscriptions.filter(
    (s) => s.status === SubscriptionStatus.ON_HOLD
  ).length;

  const bagCounter = countBags(subscriptions);

  const fortnightlyCount = subscriptions.filter(
    (s) => s.frequency === SubscriptionFrequency.FORTNIGHTLY
  ).length;

  const monthlyCount = subscriptions.filter(
    (s) => s.frequency === SubscriptionFrequency.MONTHLY
  ).length;

  return {
    activeCount,
    onHoldCount,
    fortnightlyCount,
    monthlyCount,
    bagCounter,
  };
}
