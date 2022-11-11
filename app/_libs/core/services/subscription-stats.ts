import type { Subscription } from '@prisma/client';

export interface BagCounterItem {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
}

export interface BagCounter {
  _250: BagCounterItem;
  _500: BagCounterItem;
  _1200: BagCounterItem;
}

export interface SubscriptionStats {
  totalCount: number;
  giftSubscriptionCount: number;
  b2bSubscriptionCount: number;
  subscriptionCount: number;
  monthlyCount: number;
  fortnightlyCount: number;
  bagCounterMonthly: BagCounter;
  bagCounterFortnightly: BagCounter;

  // WIP: bagCounterMonthlyMiddleOfMonth: BagCounter; HANDLE B2B ON LILL-ABO
}

function resolveBagCount(
  bagSize: number,
  subscriptions: Subscription[],
  quantity: number
) {
  if (bagSize === 250)
    return subscriptions.filter((s) => s.quantity250 === quantity).length;
  else if (bagSize === 500)
    return subscriptions.filter((s) => s.quantity500 === quantity).length;
  else if (bagSize === 1200)
    return subscriptions.filter((s) => s.quantity1200 === quantity).length;

  throw new Error('Invalid bag size');
}

function initBagCounterItem(): BagCounterItem {
  return {
    one: 0,
    two: 0,
    three: 0,
    four: 0,
    five: 0,
    six: 0,
    seven: 0,
  };
}

function initBagCounter(): BagCounter {
  return {
    _250: initBagCounterItem(),
    _500: initBagCounterItem(),
    _1200: initBagCounterItem(),
  };
}

export function countBags(
  subscriptions: Subscription[],
  bagCounter?: BagCounter | undefined | null
) {
  bagCounter = bagCounter || initBagCounter();

  bagCounter._250.one += resolveBagCount(250, subscriptions, 1);
  bagCounter._250.two += resolveBagCount(250, subscriptions, 2);
  bagCounter._250.three += resolveBagCount(250, subscriptions, 3);
  bagCounter._250.four += resolveBagCount(250, subscriptions, 4);
  bagCounter._250.five += resolveBagCount(250, subscriptions, 5);
  bagCounter._250.six += resolveBagCount(250, subscriptions, 6);
  bagCounter._250.seven += resolveBagCount(250, subscriptions, 7);

  bagCounter._500.one += resolveBagCount(500, subscriptions, 1);
  bagCounter._500.two += resolveBagCount(500, subscriptions, 2);
  bagCounter._500.three += resolveBagCount(500, subscriptions, 3);
  bagCounter._500.four += resolveBagCount(500, subscriptions, 4);
  bagCounter._500.five += resolveBagCount(500, subscriptions, 5);
  bagCounter._500.six += resolveBagCount(500, subscriptions, 6);
  bagCounter._500.seven += resolveBagCount(500, subscriptions, 7);

  bagCounter._1200.one += resolveBagCount(1200, subscriptions, 1);
  bagCounter._1200.two += resolveBagCount(1200, subscriptions, 2);
  bagCounter._1200.three += resolveBagCount(1200, subscriptions, 3);
  bagCounter._1200.four += resolveBagCount(1200, subscriptions, 4);
  bagCounter._1200.five += resolveBagCount(1200, subscriptions, 5);
  bagCounter._1200.six += resolveBagCount(1200, subscriptions, 6);
  bagCounter._1200.seven += resolveBagCount(1200, subscriptions, 7);

  return bagCounter;
}
