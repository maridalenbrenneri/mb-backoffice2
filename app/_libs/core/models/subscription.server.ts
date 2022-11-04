import { prisma } from '~/db.server';

import type { GiftSubscription, Subscription } from '@prisma/client';
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
  | 'orderDate'
  | 'type'
  | 'status'
  | 'frequency'
  | 'quantity250'
  | 'customerNote'
>;

export type GiftSubscriptionUpsertInput = Pick<
  GiftSubscription,
  | 'durationMonths'
  | 'originalFirstDeliveryDate'
  | 'firstDeliveryDate'
  | 'customerName'
  | 'messageToRecipient'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientStreet1'
  | 'recipientStreet2'
  | 'recipientPostcode'
  | 'recipientPlace'
  | 'wooCustomerId'
  | 'wooOrderId'
  | 'wooOrderLineItemId'
>;

export type B2BSubscriptionUpsertInput = Pick<
  Subscription,
  | 'id'
  | 'type'
  | 'fikenContactId'
  | 'status'
  | 'frequency'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'internalNote'
>;

export type GiftSubscriptionCreateInput = {
  subscriptionInput: SubscriptionUpsertInput;
  giftSubscriptionInput: GiftSubscriptionUpsertInput;
};

export async function getSubscription(id: number) {
  return prisma.subscription.findUnique({
    where: { id },
    include: { giftSubscription: true },
  });
}

export async function getSubscriptions() {
  return prisma.subscription.findMany();
}

export async function upsertSubscription(
  subscription: SubscriptionUpsertInput
) {
  subscription.type = SubscriptionType.PRIVATE;

  return prisma.subscription.upsert({
    where: {
      id: subscription.id || 0,
    },
    update: subscription,
    create: subscription,
  });
}

export async function upsertB2BSubscription(
  subscription: B2BSubscriptionUpsertInput
) {
  subscription.type = SubscriptionType.B2B;

  return prisma.subscription.upsert({
    where: {
      fikenContactId: subscription.fikenContactId || undefined,
    },
    update: subscription,
    create: subscription,
  });
}

// CREATES IF NEW (NO MATCH ON woo_order_id + woo_line_item_id), ON CONFLICT DO NOTHING
export async function createGiftSubscription(
  inputData: GiftSubscriptionCreateInput
) {
  inputData.subscriptionInput.type = SubscriptionType.PRIVATE_GIFT;

  console.debug('CREATE GIFT', inputData);

  return prisma.giftSubscription.upsert({
    where: {
      wooOrderLineItemId:
        inputData.giftSubscriptionInput.wooOrderLineItemId || undefined,
    },
    update: {},
    create: {
      ...inputData.giftSubscriptionInput,
      subscription: {
        create: inputData.subscriptionInput,
      },
    },
  });
}
