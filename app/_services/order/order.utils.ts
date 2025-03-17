import { WEIGHT_STANDARD_PACKAGING } from '~/_libs/core/settings';
import {
  SubscriptionSpecialRequest,
  SubscriptionType,
} from '../subscription/subscription-entity';
import { OrderEntity } from './order.entity';
import { resolveSpecialRequestCode } from '~/_libs/core/services/subscription-service';

export function calculateWeight(
  order: OrderEntity,
  includePackaging: boolean = true
) {
  let weight = 0;

  for (const item of order.orderItems) {
    if (item.variation === '_250') weight += 250 * item.quantity;
    if (item.variation === '_500') weight += 500 * item.quantity;
    if (item.variation === '_1200') weight += 1200 * item.quantity;
  }

  if (order.quantity250) weight += 250 * order.quantity250;
  if (order.quantity500) weight += 500 * order.quantity500;
  if (order.quantity1200) weight += 1200 * order.quantity1200;

  if (includePackaging) weight += WEIGHT_STANDARD_PACKAGING;

  return weight;
}

export function resolveSource(order: OrderEntity) {
  if (order.wooOrderId) return `woo`;

  if (order.subscription?.type === SubscriptionType.B2B) return 'b2b';
  if (order.subscription?.type === SubscriptionType.PRIVATE_GIFT) return 'gabo';

  return 'n/a';
}

export function generateReference(order: OrderEntity) {
  let reference = '';

  if (order.orderItems) {
    for (const item of order.orderItems) {
      let productCode = item.product?.productCode || 'n/a';

      if (item.variation === '_250')
        reference = `${reference} ${item.quantity}${productCode}`;
      if (item.variation === '_500')
        reference = `${reference} ${item.quantity}${productCode}x500g`;
      if (item.variation === '_1200')
        reference = `${reference} ${item.quantity}${productCode}x1.2kg`;
    }
  }

  if (order.quantity250) reference = `${reference} ABO${order.quantity250}`;

  if (order.quantity500)
    reference = `${reference} ABO${order.quantity500}x500g`;

  if (order.quantity1200)
    reference = `${reference} ABO${order.quantity1200}x1,2kg`;

  if (
    order.subscription &&
    order.subscription.specialRequest !== SubscriptionSpecialRequest.NONE
  )
    reference = `${reference} ${resolveSpecialRequestCode(
      order.subscription.specialRequest
    )}`;

  return reference;
}
