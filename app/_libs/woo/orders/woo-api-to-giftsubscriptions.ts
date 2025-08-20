import { DateTime } from 'luxon';

import { WOO_GABO_PRODUCT_ID } from '~/settings';

import { resolveMetadataValue } from '../utils';
import { getNextFirstTuesday } from '~/utils/dates';
import { WOO_STATUS_CANCELLED, WOO_STATUS_DELETED } from '../constants';
import { type WooOrderLineItem, type WooOrder } from './types';
import {
  resolveStatusForGiftSubscription,
  WooGiftSubscriptionCreateInput,
} from '~/services/subscription.service';
import {
  SubscriptionFrequency,
  SubscriptionStatus,
} from '~/services/entities/enums';

function createGiftSubscription(
  order: WooOrder,
  item: WooOrderLineItem
): WooGiftSubscriptionCreateInput {
  const startDateString = resolveMetadataValue(item.meta_data, 'abo_start');

  const startDate = !startDateString
    ? DateTime.fromISO(order.date_created)
    : DateTime.fromFormat(startDateString, 'dd.MM.yyyy');

  const duration_months = +resolveMetadataValue(
    item.meta_data,
    'antall-maneder'
  );

  const firstDeliveryDate = getNextFirstTuesday(startDate);

  // HANDLE CANCELLED ORDERS CONTAINING GABO's - SET SUBSCRIPTION TO DELETED
  const status =
    order.status === WOO_STATUS_CANCELLED || order.status === WOO_STATUS_DELETED
      ? SubscriptionStatus.DELETED
      : resolveStatusForGiftSubscription(duration_months, startDate);

  return {
    status,
    frequency: SubscriptionFrequency.MONTHLY,
    quantity250: +resolveMetadataValue(item.meta_data, 'poser', 0),

    wooCreatedAt: new Date(order.date_created),
    wooUpdatedAt: new Date(order.date_modified),
    wooCustomerId: order.customer_id,
    wooCustomerName: `${order.billing.first_name} ${order.billing.last_name}`,
    gift_wooOrderId: order.id,
    gift_wooOrderLineItemId: `${order.id}-${item.id}`, // UNIQUE VALUE USED TO SYNC IMPORT
    gift_durationMonths: duration_months,
    gift_customerFirstDeliveryDate: startDate.toJSDate(),
    gift_firstDeliveryDate: firstDeliveryDate.toJSDate(),
    gift_messageToRecipient: resolveMetadataValue(
      item.meta_data,
      'abo_msg_retriever'
    ),
    customerNote: order.customer_note,
    recipientName: resolveMetadataValue(item.meta_data, 'abo_name'),
    recipientEmail:
      resolveMetadataValue(item.meta_data, 'abo_email') || order.billing.email,
    recipientMobile: resolveMetadataValue(item.meta_data, 'abo_mobile'),
    recipientAddress1: resolveMetadataValue(item.meta_data, 'abo_address1'),
    recipientAddress2: resolveMetadataValue(item.meta_data, 'abo_address2'),
    recipientPostalCode: resolveMetadataValue(item.meta_data, 'abo_zip'),
    recipientPostalPlace: resolveMetadataValue(item.meta_data, 'city'),

    quantity500: 0,
    quantity1200: 0,
    internalNote: null,
  };
}

// THERE CAN BE MULTIPLE GIFT SUBSCRIPTIONS IN ONE ORDER, USE SOME DATA FROM ORDER AND SOME FROM EACH ORDER LINE
export default function wooApiToGiftSubscriptions(
  gaboOrders: WooOrder[]
): WooGiftSubscriptionCreateInput[] {
  const data = new Array<WooGiftSubscriptionCreateInput>();

  for (const order of gaboOrders) {
    for (const item of order.line_items) {
      if (item.product_id !== WOO_GABO_PRODUCT_ID) continue;

      data.push(createGiftSubscription(order, item));
    }
  }

  return data;
}
