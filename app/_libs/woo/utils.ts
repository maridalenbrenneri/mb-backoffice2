import { SubscriptionFrequency } from '~/services/entities/enums';
import * as settings from '../../settings';
import { type WooOrderMetaData } from './orders/types';

export function resolveQuantityAndFrequency(variationId: number) {
  const resolve = (frequency: SubscriptionFrequency, quantity: number) => {
    return {
      frequency,
      quantity,
    };
  };

  switch (variationId) {
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
  }
}

export function resolveMetadataValue(
  meta_data: Array<WooOrderMetaData>,
  key: string,
  valueIfNull: any = null
) {
  const res = meta_data.find((data) => data.key === key);
  return !res ? valueIfNull : res.value;
}

export function getSubstringInsideParentheses(str: string) {
  if (!str) return null;

  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(str);

  //matches[1] contains the value between the parentheses

  if (!matches || matches.length < 2) return null;

  return matches[1];
}
