import { prisma } from '~/db.server';

import type { Subscription } from '@prisma/client';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionFrequency,
} from '@prisma/client';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Subscription };
export { SubscriptionType, SubscriptionStatus, SubscriptionFrequency };

export type SubscriptionUpsertInput = Pick<
  Subscription,
  | 'id'
  | 'type'
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
      recipientCountry: 'NO',
      ...input,
    },
  });
}

export async function upsertSubscription(input: SubscriptionUpsertInput) {
  return prisma.subscription.upsert({
    where: {
      id: input.id || 0,
    },
    update: input,
    create: {
      type: input.type,
      fikenContactId: input.fikenContactId,
      status: input.status,
      frequency: input.frequency,
      quantity250: input.quantity250,
      quantity500: input.quantity500,
      quantity1200: input.quantity1200,
      recipientName: input.recipientName,
      recipientAddress1: input.recipientAddress1,
      recipientAddress2: input.recipientAddress2,
      recipientPostalCode: input.recipientPostalCode,
      recipientPostalPlace: input.recipientPostalCode,
      recipientEmail: input.recipientEmail,
      recipientMobile: input.recipientMobile,
      recipientCountry: 'NO',
      internalNote: input.internalNote,
    },
  });
}
