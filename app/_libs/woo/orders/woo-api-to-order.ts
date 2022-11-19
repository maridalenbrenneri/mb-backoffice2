import { OrderStatus, OrderType } from '@prisma/client';
import { WOO_ABO_PRODUCT_ID, WOO_GABO_PRODUCT_ID } from '~/_libs/core/settings';
import * as constants from '../constants';
import { resolveQuantityAndFrequency } from '../utils';
import wooApiToGiftSubscriptions from './woo-api-to-giftsubscriptions';

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

const resolveQuantity = (line_items: any[]) => {
  if (!line_items?.length) return 0;

  const productId = line_items[0].product_id;
  const variationId = line_items[0].variation_id;

  if (productId !== WOO_ABO_PRODUCT_ID) return 0;

  return resolveQuantityAndFrequency(variationId)?.quantity || 0;
};

const resolveFullname = (wooApiOrder: any) => {
  return `${wooApiOrder.shipping?.first_name} ${wooApiOrder.shipping?.last_name}`;
};

const wooApiToOrder = (
  wooApiOrder: any,
  subscriptionId: number,
  deliveryId: number
) => {
  if (!wooApiOrder.line_items?.length) {
    throw new Error(`No line items on order. Woo order id ${wooApiOrder.id}`);
  }

  const items: any[] = wooApiOrder.line_items.map((item: any) => {
    return {
      name: item.name,
      wooProductId: item.product_id,
      wooVariationId: item.variation_id,
      quantity: item.quantity,
    };
  });

  const isRenewalOrder = items[0].wooProductId === WOO_ABO_PRODUCT_ID;

  const orderBaseData = {
    wooOrderId: wooApiOrder.id,
    subscriptionId,
    deliveryId,
    status: resolveOrderStatus(wooApiOrder.status, wooApiOrder.payment_method),
    name: resolveFullname(wooApiOrder),
    address1: wooApiOrder.shipping?.address_1,
    address2: wooApiOrder.shipping?.address_2,
    postalCode: wooApiOrder.shipping?.postcode,
    postalPlace: wooApiOrder.shipping?.city,
    email: wooApiOrder.billing?.email,
    mobile: wooApiOrder.billing?.phone,
    customerNote: wooApiOrder.customer_note,
    quantity500: 0,
    quantity1200: 0,
  };

  if (isRenewalOrder) {
    // A RENEWAL ORDER WILL ALWAYS ONLY HAVE 1 ITEM
    const item = items[0];

    return {
      gifts: [],
      items: [],
      order: {
        ...orderBaseData,
        type: OrderType.RECURRING,
        quantity250: resolveQuantity(item.wooVariationId),
      },
    };
  }

  const hasGifts = items.some((i) => i.wooProductId === WOO_GABO_PRODUCT_ID);
  const normalItems = items.filter(
    (i) => i.wooProductId !== WOO_GABO_PRODUCT_ID
  );

  // TODO: Create Order Items for items in "normalItems". Resolve coffees...
  return {
    gifts: hasGifts ? wooApiToGiftSubscriptions([wooApiOrder]) : [],
    order: {
      ...orderBaseData,
      type: OrderType.CUSTOMIZED,
      quantity250: 0,
    },
    items: normalItems,
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
};

export default wooApiToOrder;
