import type { Order } from '@prisma/client';
import { OrderStatus, OrderType, ShippingType } from '@prisma/client';
import { WOO_ABO_PRODUCT_ID, WOO_GABO_PRODUCT_ID } from '~/_libs/core/settings';
import * as constants from '../constants';
import {
  getSubstringInsideParentheses,
  resolveQuantityAndFrequency,
} from '../utils';
import wooApiToGiftSubscriptions from './woo-api-to-giftsubscriptions';
import { WOO_NO_SHIPPING_COUPON } from '../../core/settings';
import { type WooOrderLineItem, type WooOrder } from './types';

export type OrderInfo = {
  order: Order;
  items: any[];
  gifts: any[];
  wooCreatedVia: string;
  wooCustomerId: number;
};

const resolveOrderStatus = (
  wooStatus: string,
  paymentMethod: string
): OrderStatus => {
  // Vipps orders have woo status ON_HOLD, MB treats as PROCESSING
  const isVipps = paymentMethod === 'vipps';
  if (isVipps && wooStatus === constants.WOO_STATUS_ON_HOLD)
    return OrderStatus.ACTIVE;

  if (wooStatus === constants.WOO_STATUS_PROCESSING) return OrderStatus.ACTIVE;
  if (wooStatus === constants.WOO_STATUS_CANCELLED)
    return OrderStatus.CANCELLED;
  if (wooStatus === constants.WOO_STATUS_COMPLETED)
    return OrderStatus.COMPLETED;
  if (wooStatus === constants.WOO_STATUS_ON_HOLD) return OrderStatus.ON_HOLD;

  throw new Error(`Unknown status "${wooStatus}"`);
};

const resolveQuantity = (variationId: number) => {
  const foo = resolveQuantityAndFrequency(variationId);
  return foo?.quantity || 0;
};

const resolveFullname = (wooApiOrder: any) => {
  return `${wooApiOrder.shipping?.first_name} ${wooApiOrder.shipping?.last_name}`;
};

function resolveShippingType(wooApiOrder: any) {
  const couponLines = wooApiOrder.coupon_lines;

  if (couponLines?.some((d: any) => d.code === WOO_NO_SHIPPING_COUPON))
    return ShippingType.LOCAL_PICK_UP;

  return ShippingType.SHIP;
}

export function hasSupportedStatus(wooApiOrder: any) {
  switch (wooApiOrder.status) {
    case constants.WOO_STATUS_PROCESSING:
    case constants.WOO_STATUS_CANCELLED:
    case constants.WOO_STATUS_COMPLETED:
    case constants.WOO_STATUS_ON_HOLD:
      return true;
  }

  console.debug(
    'Unsupported Woo Status on order',
    wooApiOrder.id,
    wooApiOrder.status
  );

  return false;
}

export default async function wooApiToOrderInfo(
  wooOrder: WooOrder
): Promise<OrderInfo> {
  if (!wooOrder.line_items?.length) {
    throw new Error(`No line items on order. Woo order id ${wooOrder.id}`);
  }

  const items: any[] = wooOrder.line_items.map((item: WooOrderLineItem) => {
    return {
      wooOrderItemId: item.id,
      name: item.name,
      wooProductId: item.product_id,
      wooVariationId: item.variation_id,
      quantity: item.quantity,
      productCode: getSubstringInsideParentheses(item.name),
    };
  });

  const isRenewalOrder = items[0].wooProductId === WOO_ABO_PRODUCT_ID;

  const orderBaseData: any = {
    wooOrderId: wooOrder.id,
    wooOrderNumber: wooOrder.number,
    wooCustomerId: wooOrder.customer_id,
    wooCreatedAt: new Date(wooOrder.date_created),
    status: resolveOrderStatus(wooOrder.status, wooOrder.payment_method),
    shippingType: resolveShippingType(wooOrder),
    name: resolveFullname(wooOrder),
    address1: wooOrder.shipping?.address_1,
    address2: wooOrder.shipping?.address_2,
    postalCode: wooOrder.shipping?.postcode,
    postalPlace: wooOrder.shipping?.city,
    email: wooOrder.billing?.email,
    mobile: wooOrder.billing?.phone,
    customerNote: wooOrder.customer_note,
    quantity500: 0,
    quantity1200: 0,
  };

  if (isRenewalOrder) {
    // A RENEWAL ORDER WILL ALWAYS ONLY HAVE 1 ITEM
    return {
      gifts: [],
      items: [],
      order: {
        ...orderBaseData,
        type: OrderType.RENEWAL,
        quantity250: resolveQuantity(items[0].wooVariationId),
      },
      wooCreatedVia: wooOrder.created_via,
      wooCustomerId: wooOrder.customer_id,
    };
  }

  const hasGifts = items.some((i) => i.wooProductId === WOO_GABO_PRODUCT_ID);
  const normalItems = items.filter(
    (i) => i.wooProductId !== WOO_GABO_PRODUCT_ID
  );
  const gifts = hasGifts ? wooApiToGiftSubscriptions([wooOrder]) : [];
  if (gifts.length)
    console.debug(`Found ${gifts.length} gift subscriptions in orders`);

  return {
    gifts,
    order: {
      ...orderBaseData,
      type: OrderType.CUSTOM,
      quantity250: 0,
    },
    items: normalItems,
    wooCreatedVia: wooOrder.created_via,
    wooCustomerId: wooOrder.customer_id,
  };

  /* FOR SUBSCRIPTION RENEWALS, TYPE WILL BE IN items[0]. From:
    line_items: [
    {
      id: 40501,
      name: 'Kaffeabonnement - 2, Annenhver uke',
      product_id: 456,
      variation_id: 571,
      quantity: 1,
      tax_class: 'redusert-sats',
      subtotal: '173.91',
      subtotal_tax: '26.09',
      total: '173.91',
      total_tax: '26.09',
      taxes: [Array],
      meta_data: [Array],
      sku: '',
      price: 173.913043,
      parent_name: 'Kaffeabonnement'
    }
  ],
  */
}
