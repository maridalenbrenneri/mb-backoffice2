import { DateTime } from 'luxon';

import type {
  GiftSubscriptionWithSubscriptionCreateInput,
  Subscription,
} from '~/_libs/core/models/subscription.server';
import {
  SubscriptionFrequency,
  SubscriptionType,
} from '~/_libs/core/models/subscription.server';
import { resolveStatusAndFirstDeliveryDate } from '~/_libs/core/utils/gift-subscription-helper';
import { WOO_GABO_PRODUCT_ID } from '../settings';

function resolveMetadataValue(meta_data: Array<any>, key: string) {
  const res = meta_data.find((data) => data.key === key);
  return !res ? null : res.value;
}

function itemToSubscription(
  item: any
): GiftSubscriptionWithSubscriptionCreateInput {
  const duration_months = +resolveMetadataValue(
    item.meta_data,
    'antall-maneder'
  );

  let startDate = null;
  let startDateString = resolveMetadataValue(item.meta_data, 'abo_start');

  if (!startDateString) {
    startDate = DateTime.fromISO(item.date_created_gmt);
  } else {
    startDate = DateTime.fromFormat(startDateString, 'dd.MM.yyyy');
  }

  // console.log("date_created_gmt", item.date_created_gmt);
  // console.log("startDateString", startDateString);
  // console.log("startDate", startDate.toISODate());

  const statusAndDeliveryDate = resolveStatusAndFirstDeliveryDate(
    duration_months,
    startDate
  );

  // IF RECIPIENT EMAIL IS NOT SET, WE USE EMAIL OF THE PAYING CUSTOMER
  const email =
    resolveMetadataValue(item.meta_data, 'abo_email') || item.customer_email;

  return {
    subscriptionInput: {
      type: SubscriptionType.PRIVATE_GIFT,
      status: statusAndDeliveryDate.status,
      orderDate: DateTime.fromISO(item.date_created).toJSDate(),

      frequency: SubscriptionFrequency.MONTHLY,
      quantity250: +resolveMetadataValue(item.meta_data, 'poser'),

      customerNote: item.customer_note,
    },
    giftSubscriptionInput: {
      // wooSubscriptionId: null,
      // wooUpdatedAt: DateTime.fromISO(item.date_modified).toJSDate(),
      wooCustomerId: item.customer_id,
      wooOrderId: item.order_id,
      wooOrderLineItemId: `${item.order_id}-${item.id}`, // MAKE SURE THIS IS UNIQUE

      customerName: item.customer_name,
      durationMonths: duration_months,
      originalFirstDeliveryDate: startDate.toJSDate(),
      firstDeliveryDate: statusAndDeliveryDate.firstDeliveryDate.toJSDate(),
      recipientName: resolveMetadataValue(item.meta_data, 'abo_name'),
      recipientEmail: email,
      recipientMobile: resolveMetadataValue(item.meta_data, 'abo_mobile'),
      recipientStreet1: resolveMetadataValue(item.meta_data, 'abo_address1'),
      recipientStreet2: resolveMetadataValue(item.meta_data, 'abo_address2'),
      recipientPostcode: resolveMetadataValue(item.meta_data, 'abo_zip'),
      recipientPlace: resolveMetadataValue(item.meta_data, 'city'),
      messageToRecipient: resolveMetadataValue(
        item.meta_data,
        'abo_msg_retriever'
      ),
    },
  };
}

// THERE CAN BE MULTIPLE GIFT SUBSCRIPTIONS IN ONE ORDER
//  PICK SOME DATA FROM ORDER AND SOME FROM EACH ORDER LINE
export default function wooApiToGiftSubscriptions(
  wooGaboOrders: any[]
): Array<GiftSubscriptionWithSubscriptionCreateInput> {
  const giftSubscriptionsData =
    new Array<GiftSubscriptionWithSubscriptionCreateInput>();

  for (const order of wooGaboOrders) {
    // console.debug(order);

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

      // console.log('GIFTSUBSCRIPTION TO WRITE', mbSubscription);

      giftSubscriptionsData.push(giftSubscriptionData);
    }
  }

  return giftSubscriptionsData;
}
