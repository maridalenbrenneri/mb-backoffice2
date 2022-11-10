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
  | 'type'
  | 'fikenContactId'
  | 'recipientName'
  | 'status'
  | 'frequency'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'internalNote'
>;

export type GiftSubscriptionUpdateInput = Pick<
  GiftSubscription,
  | 'id'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
>;

export type GiftSubscriptionCreateInput = Pick<
  GiftSubscription,
  | 'durationMonths'
  | 'originalFirstDeliveryDate'
  | 'firstDeliveryDate'
  | 'customerName'
  | 'customerNote'
  | 'messageToRecipient'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'wooCustomerId'
  | 'wooOrderId'
  | 'wooOrderLineItemId'
  | 'wooOrderDate'
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

export type GiftSubscriptionWithSubscriptionCreateInput = {
  subscriptionInput: SubscriptionUpsertInput;
  giftSubscriptionInput: GiftSubscriptionCreateInput;
};

export async function getSubscription(id: number) {
  return prisma.subscription.findUnique({
    where: { id },
    include: { giftSubscription: true, orders: true },
  });
}

export async function getSubscriptions(filter: any) {
  return prisma.subscription.findMany(filter);
}

export async function upsertSubscription(
  subscription: SubscriptionUpsertInput
) {
  return prisma.subscription.upsert({
    where: {
      id: subscription.id || 0,
    },
    update: subscription,
    create: {
      type: subscription.type,
      recipientName: subscription.recipientName,
      fikenContactId: subscription.fikenContactId,
      status: subscription.status,
      frequency: subscription.frequency,
      quantity250: subscription.quantity250,
      quantity500: subscription.quantity500,
      quantity1200: subscription.quantity1200,
      internalNote: subscription.internalNote,
    },
  });
}

// export async function upsertB2BSubscription(
//   subscription: B2BSubscriptionUpsertInput
// ) {
//   subscription.type = SubscriptionType.B2B;

//   return prisma.subscription.upsert({
//     where: {
//       fikenContactId: subscription.fikenContactId || undefined,
//     },
//     update: subscription,
//     create: subscription,
//   });
// }

export async function getGiftSubscription(id: number) {
  return prisma.giftSubscription.findUnique({
    where: { id },
  });
}

export async function updateGiftSubscription(
  subscription: GiftSubscriptionUpdateInput
) {
  return prisma.giftSubscription.update({
    where: {
      id: subscription.id,
    },
    data: subscription,
  });
}

// CREATES IF NEW (NO MATCH ON woo_order_id + woo_line_item_id), ON CONFLICT DO NOTHING
export async function createGiftSubscription(
  inputData: GiftSubscriptionWithSubscriptionCreateInput
) {
  inputData.subscriptionInput.type = SubscriptionType.PRIVATE_GIFT;

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
