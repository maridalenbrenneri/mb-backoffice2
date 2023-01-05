import { prisma } from '~/db.server';

import type { Subscription } from '@prisma/client';
import { ShippingType } from '@prisma/client';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionFrequency,
} from '@prisma/client';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';
import { nullIfEmptyOrWhitespace } from '../utils/strings';

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
  | 'wooCustomerName'
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
  | 'wooCustomerName'
  | 'gift_firstDeliveryDate'
  | 'gift_customerFirstDeliveryDate'
  | 'gift_durationMonths'
  | 'gift_messageToRecipient'
>;

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
      wooCustomerId: data.wooCustomerId,
      wooCustomerName: data.wooCustomerName,
      wooNextPaymentDate: data.wooNextPaymentDate,
      wooCreatedAt: data.wooCreatedAt,
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
  const createData = {
    type: data.type,
    status: data.status,
    shippingType: data.shippingType,
    frequency: data.frequency,
    quantity250: data.quantity250,
    quantity500: data.quantity500,
    quantity1200: data.quantity1200,
    wooCustomerName: data.wooCustomerName,
    recipientName: data.recipientName,
    recipientAddress1: data.recipientAddress1,
    recipientAddress2: data.recipientAddress2,
    recipientPostalCode: data.recipientPostalCode,
    recipientPostalPlace: data.recipientPostalCode,
    recipientEmail: data.recipientEmail,
    recipientMobile: data.recipientMobile,
    recipientCountry: 'NO',
    internalNote: data.internalNote,
    fikenContactId: nullIfEmptyOrWhitespace(data.fikenContactId),
  };

  return prisma.subscription.upsert({
    where: {
      id: id || 0,
    },
    update: data,
    create: createData,
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

export async function updateFirstDeliveryDateOnSubscription(
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
