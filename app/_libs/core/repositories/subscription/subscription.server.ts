import { prisma } from '~/db.server';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../../settings';
import { areEqual } from '../../utils/are-equal';
import type {
  AtLeastOne,
  CreateSubscriptionData,
  GiftSubscriptionCreateInput,
  Subscription,
  SubscriptionStatus,
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

// WOO IMPORT
export async function createGiftSubscription(
  input: GiftSubscriptionCreateInput
) {
  return prisma.subscription.upsert({
    where: {
      gift_wooOrderLineItemId: input.gift_wooOrderLineItemId || undefined,
    },
    update: {},
    create: {
      type: SubscriptionType.PRIVATE_GIFT,
      shippingType: ShippingType.SHIP,
      recipientCountry: 'NO',
      ...input,
    },
  });
}

// WOO IMPORT
export async function upsertSubscriptionFromWoo(data: any): Promise<{
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
      if (!areEqual(dbSubscription[key], data[key])) {
        isChanged = true;
        break;
      }
    }
    if (isChanged) {
      let res = await prisma.subscription.update({
        where: {
          wooSubscriptionId: data.wooSubscriptionId,
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
      type: data.type,
      wooSubscriptionId: data.wooSubscriptionId,
      wooCustomerId: data.wooCustomerId,
      wooCustomerName: data.wooCustomerName,
      wooNextPaymentDate: data.wooNextPaymentDate,
      wooCreatedAt: data.wooCreatedAt,
      wooUpdatedAt: data.wooUpdatedAt,
      status: data.status,
      shippingType: data.shippingType,
      frequency: data.frequency,
      quantity250: data.quantity250,
      recipientName: data.recipientName,
      recipientAddress1: data.recipientAddress1,
      recipientAddress2: data.recipientAddress2,
      recipientPostalCode: data.recipientPostalCode,
      recipientPostalPlace: data.recipientPostalPlace,
      recipientEmail: data.recipientEmail,
      recipientMobile: data.recipientMobile,
      recipientCountry: 'NO',
    },
  });

  return {
    result: 'new',
    subscriptionId: res.id,
  };
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
