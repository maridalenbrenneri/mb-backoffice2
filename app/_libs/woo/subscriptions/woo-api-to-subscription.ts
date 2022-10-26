import { DateTime } from "luxon";

import {
  WOO_STATUS_ACTIVE,
  WOO_STATUS_CANCELLED,
  WOO_STATUS_ON_HOLD,
} from "../settings";

import * as settings from "../settings";

import type { SubscriptionUpsertInput } from "~/_libs/core/models/subscription.server";
import {
  SubscriptionStatus,
  SubscriptionFrequency,
  SubscriptionType,
} from "~/_libs/core/models/subscription.server";

interface IWooSubscriptionProduct {
  name: string;
  productId: string;
  variationId: string;
}

const resolveSubscriptionVariation = (
  wooProduct: IWooSubscriptionProduct
): { frequency: SubscriptionFrequency; bagCount250: number } => {
  if (+wooProduct.productId !== settings.WOO_ABO_PRODUCT_ID)
    throw new Error(
      `Unknown Woo product, don't know what to do with this. Woo Product id: ${wooProduct.productId}`
    );

  const resolve = (frequency: SubscriptionFrequency, bagCount250: number) => {
    return {
      frequency,
      bagCount250,
    };
  };

  switch (+wooProduct.variationId) {
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
        `Unknown Woo product variation, don't know what to do with this. Woo Product Variation id: ${wooProduct.variationId}`
      );
  }
};

const resolveSubscriptionStatus = (wooStatus: string): SubscriptionStatus => {
  switch (wooStatus) {
    case WOO_STATUS_ACTIVE:
      return SubscriptionStatus.ACTIVE;
    case WOO_STATUS_ON_HOLD:
      return SubscriptionStatus.ON_HOLD;
    case WOO_STATUS_CANCELLED:
      return SubscriptionStatus.CANCELLED;
    default:
      return SubscriptionStatus.DELETED;
  }
};

const wooApiToSubscription = (subscription: any): SubscriptionUpsertInput => {
  if (!subscription.line_items?.length)
    throw new Error(
      `ERROR when importing Woo subscription, no line items on subscription. Woo subscription id ${subscription.id}`
    );

  if (subscription.line_items.length > 1)
    console.warn(
      `Woo subscription contains more than one line item, dont know what to do with that. First one will be used. Woo subscription id ${subscription.id}`
    );

  const variation = resolveSubscriptionVariation({
    name: subscription.line_items[0].name,
    productId: subscription.line_items[0].product_id,
    variationId: subscription.line_items[0].variation_id,
  });

  return {
    id: 1,
    status: resolveSubscriptionStatus(subscription.status),
    orderDate: DateTime.fromISO(subscription.date_created).toJSDate(),
    type: SubscriptionType.PRIVATE,
    frequency: variation.frequency,
    quantity250: variation.bagCount250,
    recipientName: `
      ${subscription.shipping?.first_name || ""} ${
      subscription.shipping?.last_name || ""
    }`,
    recipientEmail: subscription.billing?.email,
    recipientMobile: subscription.billing?.mobile,
    recipientAddress: JSON.stringify({
      address1: subscription.shipping?.address_1,
      address2: subscription.shipping?.address_2,
      place: subscription.shipping?.city,
      postcode: subscription.shipping?.postcode,
    }),

    customerNote: subscription.customer_note,

    wooSubscriptionId: subscription.id,
    wooCustomerId: subscription.customer_id,
    wooUpdatedAt: DateTime.fromISO(subscription.date_modified).toJSDate(),
  };
};

export default wooApiToSubscription;
