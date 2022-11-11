import { prisma } from '~/db.server';

import type { Subscription } from '@prisma/client';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionFrequency,
} from '@prisma/client';

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
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

export async function getSubscriptions(filter: any) {
  return prisma.subscription.findMany(filter);
}

export async function createGiftSubscription(
  input: GiftSubscriptionCreateInput
) {
  return prisma.subscription.create({
    data: {
      type: SubscriptionType.PRIVATE_GIFT,
      recipientCountry: 'Norway',
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
      recipientCountry: 'Norway',
      internalNote: input.internalNote,
    },
  });
}
