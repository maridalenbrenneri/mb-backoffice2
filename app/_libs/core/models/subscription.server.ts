import { prisma } from '~/db.server';

import type { Subscription } from '@prisma/client';
import { ShippingType } from '@prisma/client';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionFrequency,
} from '@prisma/client';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Subscription };
export { SubscriptionType, SubscriptionStatus, SubscriptionFrequency };

export type SubscriptionUpsertData = Pick<
  Subscription,
  | 'type'
  | 'status'
  | 'frequency'
  | 'shippingType'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'internalNote'
  | 'fikenContactId'
>;

// Special for Woo imported gift subscriptions
export type GiftSubscriptionCreateInput = Pick<
  Subscription,
  | 'status'
  | 'frequency'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'customerNote'
  | 'internalNote'
  | 'gift_wooOrderId'
  | 'gift_wooOrderLineItemId'
  | 'gift_wooCustomerName'
  | 'gift_firstDeliveryDate'
  | 'gift_durationMonths'
  | 'gift_messageToRecipient'
>;

export async function getSubscription(id: number) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          delivery: true,
          orderItems: true,
        },
        take: TAKE_MAX_ROWS,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
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

// CREATE FOR WOO IMPORT, NEVER DOES UPDATE
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

// SPECIAL UPSERT USED BY WOO IMPORT
export async function upsertSubscriptionByWooSubscriptionId(data: any) {
  return prisma.subscription.upsert({
    where: {
      wooSubscriptionId: data.wooSubscriptionId || 0,
    },
    update: data,
    create: {
      type: data.type,
      wooSubscriptionId: data.wooSubscriptionId,
      status: data.status,
      shippingType: data.shippingType,
      frequency: data.frequency,
      quantity250: data.quantity250,
      recipientName: data.recipientName,
      recipientAddress1: data.recipientAddress1,
      recipientAddress2: data.recipientAddress2,
      recipientPostalCode: data.recipientPostalCode,
      recipientPostalPlace: data.recipientPostalCode,
      recipientEmail: data.recipientEmail,
      recipientMobile: data.recipientMobile,
      recipientCountry: 'NO',
    },
  });
}

export async function upsertSubscription(
  id: number | null,
  data: SubscriptionUpsertData
) {
  return prisma.subscription.upsert({
    where: {
      id: id || 0,
    },
    update: data,
    create: {
      type: data.type,
      fikenContactId: data.fikenContactId,
      status: data.status,
      shippingType: data.shippingType,
      frequency: data.frequency,
      quantity250: data.quantity250,
      quantity500: data.quantity500,
      quantity1200: data.quantity1200,
      recipientName: data.recipientName,
      recipientAddress1: data.recipientAddress1,
      recipientAddress2: data.recipientAddress2,
      recipientPostalCode: data.recipientPostalCode,
      recipientPostalPlace: data.recipientPostalCode,
      recipientEmail: data.recipientEmail,
      recipientMobile: data.recipientMobile,
      recipientCountry: 'NO',
      internalNote: data.internalNote,
    },
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
