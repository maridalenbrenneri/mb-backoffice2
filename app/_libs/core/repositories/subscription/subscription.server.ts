import { prisma } from '~/db.server';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../../settings';
import { areEqual } from '../../utils/are-equal';
import type {
  AtLeastOne,
  CreateSubscriptionData,
  WooGiftSubscriptionCreateInput,
  Subscription,
  SubscriptionStatus,
  WooUpsertSubscriptionData,
} from './types';
import { ShippingType, SubscriptionType } from './types';

export async function getSubscription(filter: any) {
  return prisma.subscription.findFirst(filter);
}

export async function getSubscriptions(filter?: any) {
  filter = filter || {
    include: {
      orders: true,
      deliveries: true,
    },
  };

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  return prisma.subscription.findMany(filter);
}

export async function create(data: CreateSubscriptionData) {
  return prisma.subscription.create({
    data,
  });
}

export async function update(id: number, data: AtLeastOne<Subscription>) {
  return prisma.subscription.update({
    where: { id },
    data,
  });
}

export async function updateStatusOnSubscription(
  id: number,
  status: SubscriptionStatus
) {
  return prisma.subscription.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function updateFirstDeliveryDateOnGiftSubscription(
  id: number,
  gift_firstDeliveryDate: any
) {
  return prisma.subscription.update({
    where: {
      id,
    },
    data: {
      gift_firstDeliveryDate,
    },
  });
}

// WOO IMPORT
export async function createGiftSubscriptionFromWoo(
  input: WooGiftSubscriptionCreateInput
) {
  return prisma.subscription.create({
    data: {
      type: SubscriptionType.PRIVATE_GIFT,
      shippingType: ShippingType.SHIP,
      recipientCountry: 'NO',
      ...input,
    },
  });
}

// WOO IMPORT
export async function upsertSubscriptionFromWoo(
  data: WooUpsertSubscriptionData
): Promise<{
  result: 'updated' | 'new' | 'notChanged';
  subscriptionId: number;
}> {
  let dbSubscription = await prisma.subscription.findFirst({
    where: {
      wooSubscriptionId: data.wooSubscriptionId,
    },
  });

  // Check if any value has changed
  if (dbSubscription) {
    const keys = Object.keys(data) as (keyof Subscription)[];
    let isChanged = false;
    for (let key of keys) {
      if (
        !areEqual(
          dbSubscription[key],
          data[key as keyof WooUpsertSubscriptionData]
        )
      ) {
        isChanged = true;
        break;
      }
    }
    if (isChanged) {
      let res = await prisma.subscription.update({
        where: {
          wooSubscriptionId: data.wooSubscriptionId as number,
        },
        data,
      });

      return {
        result: 'updated',
        subscriptionId: res.id,
      };
    }

    return {
      result: 'notChanged',
      subscriptionId: dbSubscription.id,
    };
  }

  let res = await prisma.subscription.create({
    data: {
      ...data,
      recipientCountry: 'NO',
    },
  });

  return {
    result: 'new',
    subscriptionId: res.id,
  };
}
