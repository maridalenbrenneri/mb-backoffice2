import {
  WOO_STATUS_ACTIVE,
  WOO_STATUS_CANCELLED,
  WOO_STATUS_DELETED,
  WOO_STATUS_EXPIRED,
  WOO_STATUS_ON_HOLD,
  WOO_STATUS_PENDING_CANCEL,
} from '../constants';

import * as settings from '../../../settings';
import type { WooUpsertSubscriptionData } from '~/services/subscription.service';
import {
  ShippingType,
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '~/services/entities/enums';
import type { WooSubscription, WooSubscriptionLineItem } from './types';

const resolveSubscriptionVariation = (
  item: WooSubscriptionLineItem
): { frequency: SubscriptionFrequency; bagCount250: number } | null => {
  if (+item.product_id !== settings.WOO_ABO_PRODUCT_ID) {
    console.warn(
      `Unknown Woo product, don't know what to do with this. Woo Product id: ${item.product_id}`
    );
    return null;
  }

  const resolve = (frequency: SubscriptionFrequency, bagCount250: number) => {
    return {
      frequency,
      bagCount250,
    };
  };

  switch (item.variation_id) {
    case settings.WOO_ABO_PRODUCT_VARIATION_1_1:
      return resolve(SubscriptionFrequency.MONTHLY, 1);
    case settings.WOO_ABO_PRODUCT_VARIATION_2_1:
      return resolve(SubscriptionFrequency.MONTHLY, 2);
    case settings.WOO_ABO_PRODUCT_VARIATION_3_1:
      return resolve(SubscriptionFrequency.MONTHLY, 3);
    case settings.WOO_ABO_PRODUCT_VARIATION_4_1:
      return resolve(SubscriptionFrequency.MONTHLY, 4);
    case settings.WOO_ABO_PRODUCT_VARIATION_5_1:
      return resolve(SubscriptionFrequency.MONTHLY, 5);
    case settings.WOO_ABO_PRODUCT_VARIATION_6_1:
      return resolve(SubscriptionFrequency.MONTHLY, 6);
    case settings.WOO_ABO_PRODUCT_VARIATION_7_1:
      return resolve(SubscriptionFrequency.MONTHLY, 7);

    case settings.WOO_ABO_PRODUCT_VARIATION_1_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 1);
    case settings.WOO_ABO_PRODUCT_VARIATION_2_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 2);
    case settings.WOO_ABO_PRODUCT_VARIATION_3_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 3);
    case settings.WOO_ABO_PRODUCT_VARIATION_4_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 4);
    case settings.WOO_ABO_PRODUCT_VARIATION_5_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 5);
    case settings.WOO_ABO_PRODUCT_VARIATION_6_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 4);
    case settings.WOO_ABO_PRODUCT_VARIATION_7_2:
      return resolve(SubscriptionFrequency.FORTNIGHTLY, 7);

    default:
      throw new Error(
        `Unknown Woo product variation, don't know what to do with this. Woo Product Variation id: ${item.variation_id}`
      );
  }
};

const resolveSubscriptionStatus = (wooStatus: string): SubscriptionStatus => {
  switch (wooStatus) {
    case WOO_STATUS_ACTIVE:
    case WOO_STATUS_PENDING_CANCEL:
      return SubscriptionStatus.ACTIVE;
    case WOO_STATUS_ON_HOLD:
      return SubscriptionStatus.ON_HOLD;
    case WOO_STATUS_CANCELLED:
    case WOO_STATUS_DELETED:
    case WOO_STATUS_EXPIRED:
      return SubscriptionStatus.DELETED;
    default: {
      console.warn(
        'Unknown Woo Status, setting to DELETED. Woo status:',
        wooStatus
      );
      return SubscriptionStatus.DELETED;
    }
  }
};

function resolveShippingType(subscription: WooSubscription) {
  if (
    subscription.coupon_lines?.some(
      (d: { code: string }) => d.code === settings.WOO_NO_SHIPPING_COUPON
    )
  ) {
    return ShippingType.LOCAL_PICK_UP;
  }

  return ShippingType.SHIP;
}

export const wooApiToUpsertSubscriptionData = (
  subscription: WooSubscription
): WooUpsertSubscriptionData | null => {
  if (!subscription.line_items?.length) {
    console.warn(
      `Woo subscription contains no line items, dont know what to do with that. Woo subscription id ${subscription.id}`
    );
    return null;
  }

  if (subscription.line_items.length !== 1)
    console.warn(
      `Woo subscription contains more than one line item, dont know what to do with that. First one will be used. Woo subscription id ${subscription.id}`
    );

  let variation = resolveSubscriptionVariation(subscription.line_items[0]);

  if (!variation) return null;

  let status = resolveSubscriptionStatus(subscription.status);

  return {
    wooSubscriptionId: subscription.id,
    wooCustomerId: subscription.customer_id,
    wooCustomerName: `${subscription.billing.first_name} ${subscription.billing.last_name} `,
    wooCreatedAt: new Date(subscription.date_created),
    wooUpdatedAt: new Date(subscription.date_modified),
    wooNextPaymentDate: subscription.next_payment_date_gmt
      ? new Date(subscription.next_payment_date_gmt)
      : null,
    type: SubscriptionType.PRIVATE,
    status,
    shippingType: resolveShippingType(subscription),
    frequency: variation.frequency,
    quantity250: variation.bagCount250,
    recipientName: `${subscription.shipping.first_name} ${subscription.shipping.last_name} `,
    recipientAddress1: subscription.shipping.address_1,
    recipientAddress2: subscription.shipping.address_2,
    recipientPostalCode: subscription.shipping.postcode,
    recipientPostalPlace: subscription.shipping.city,
    recipientEmail: subscription.billing.email,
    recipientMobile: subscription.billing.phone,
    isPrivateDeliveryAddress: true,
  };
};
