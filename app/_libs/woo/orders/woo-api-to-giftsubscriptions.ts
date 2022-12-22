import { DateTime } from 'luxon';

import type { GiftSubscriptionCreateInput } from '@prisma/client';
import { SubscriptionFrequency, SubscriptionType } from '@prisma/client';

import { WOO_GABO_PRODUCT_ID } from '~/_libs/core/settings';
import { resolveStatusForGiftSubscription } from '~/_libs/core/services/subscription-service';
import { resolveMetadataValue } from '../utils';
import { resolveDateForNextMonthlyDelivery } from '~/_libs/core/utils/dates';

function itemToSubscription(item: any): GiftSubscriptionCreateInput {
  const startDateString = resolveMetadataValue(item.meta_data, 'abo_start');
  const startDate = !startDateString
    ? DateTime.fromISO(item.date_created_gmt)
    : DateTime.fromFormat(startDateString, 'dd.MM.yyyy');
  const duration_months = +resolveMetadataValue(
    item.meta_data,
    'antall-maneder'
  );

  const firstDeliveryDate = resolveDateForNextMonthlyDelivery(startDate);

  return {
    type: SubscriptionType.PRIVATE_GIFT,
    status: resolveStatusForGiftSubscription(duration_months, startDate),
    frequency: SubscriptionFrequency.MONTHLY,
    quantity250: +resolveMetadataValue(item.meta_data, 'poser'),

    wooCreatedAt: new Date(item.date_created),
    wooCustomerId: item.customer_id,
    gift_wooCustomerName: item.customer_name,
    gift_wooOrderId: item.order_id,
    gift_wooOrderLineItemId: `${item.order_id}-${item.id}`, // UNIQUE VALUE USED TO SYNC IMPORT
    gift_durationMonths: duration_months,
    gift_firstDeliveryDate: firstDeliveryDate.toJSDate(),
    gift_messageToRecipient: resolveMetadataValue(
      item.meta_data,
      'abo_msg_retriever'
    ),
    customerNote: item.customer_note,
    recipientName: resolveMetadataValue(item.meta_data, 'abo_name'),
    recipientEmail:
      resolveMetadataValue(item.meta_data, 'abo_email') || item.customer_email,
    recipientMobile: resolveMetadataValue(item.meta_data, 'abo_mobile'),
    recipientAddress1: resolveMetadataValue(item.meta_data, 'abo_address1'),
    recipientAddress2: resolveMetadataValue(item.meta_data, 'abo_address2'),
    recipientPostalCode: resolveMetadataValue(item.meta_data, 'abo_zip'),
    recipientPostalPlace: resolveMetadataValue(item.meta_data, 'city'),

    quantity500: 0,
    quantity1200: 0,
    fikenContactId: null,
    internalNote: null,
  };
}

// THERE CAN BE MULTIPLE GIFT SUBSCRIPTIONS IN ONE ORDER, USE SOME DATA FROM ORDER AND SOME FROM EACH ORDER LINE
export default function wooApiToGiftSubscriptions(
  wooGaboOrders: any[]
): GiftSubscriptionCreateInput[] {
  const giftSubscriptionsData = new Array<GiftSubscriptionCreateInput>();

  for (const order of wooGaboOrders) {
    const order_number = +resolveMetadataValue(
      order.meta_data,
      '_order_number'
    );

    for (const item of order.line_items) {
      if (item.product_id !== WOO_GABO_PRODUCT_ID) continue;

      item.order_id = order.id;
      item.order_number = order_number;
      item.date_created = order.date_created;
      item.date_modified = order.date_modified;
      item.customer_note = order.customer_note;
      item.customer_id = order.customer_id;
      item.customer_name = `${order.billing.first_name} ${order.billing.last_name}`;
      item.customer_email = order.billing.email;

      const giftSubscriptionData = itemToSubscription(item);

      giftSubscriptionsData.push(giftSubscriptionData);
    }
  }

  return giftSubscriptionsData;
}
