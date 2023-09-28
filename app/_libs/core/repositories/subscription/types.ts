import {
  SubscriptionStatus,
  SubscriptionFrequency,
  ShippingType,
  SubscriptionType,
  SubscriptionSpecialRequest,
} from '@prisma/client';

import type { Subscription } from '@prisma/client';

export {
  SubscriptionType,
  ShippingType,
  Subscription,
  SubscriptionStatus,
  SubscriptionFrequency,
  SubscriptionSpecialRequest,
};

export type SubscriptionUpsertData = Pick<
  Subscription,
  | 'type'
  | 'status'
  | 'frequency'
  | 'shippingType'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'specialRequest'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'isPrivateDeliveryAddress'
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
