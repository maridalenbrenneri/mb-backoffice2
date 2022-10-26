import * as settings from "../settings";

const resolveOrderStatus = (
  wooStatus: string,
  paymentMethod: string
): string => {
  // Vipps orders have woo status ON_HOLD, MB treats as PROCESSING
  const isVipps = paymentMethod === "Vipps";
  if (isVipps && wooStatus === settings.WOO_STATUS_ON_HOLD)
    return settings.WOO_STATUS_PROCESSING;

  return wooStatus;
};

const resolveAboType = (line_items: any[]) => {
  if (!line_items?.length) return null;

  const productId = line_items[0].product_id;
  const variationId = line_items[0].variation_id;

  if (productId !== settings.WOO_ABO_PRODUCT_ID) return null;

  return variationId;
};

const resolveFullname = (wooApiOrder: any) => {
  return `${wooApiOrder.shipping?.first_name} ${wooApiOrder.shipping?.last_name}`;
};

const wooApiToOrder = (wooApiOrder: any): any => {
  if (!wooApiOrder.line_items?.length) {
    console.log(wooApiOrder);
    throw new Error(
      `Error when importing Woo order, no line items on order. Woo order id ${wooApiOrder.id}`
    );
  }

  const items: [] = wooApiOrder.line_items.map((item: any) => {
    return {
      name: item.name,
      wooProductId: item.product_id,
      wooVariationId: item.variation_id,
      quantity: item.quantity,
    };
  });

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

  return {
    status: resolveOrderStatus(wooApiOrder.status, wooApiOrder.payment_method),
    subscriptionRenewal: resolveAboType(wooApiOrder.line_items),
    shippingName: resolveFullname(wooApiOrder),
    shippingAddress1: wooApiOrder.shipping?.address_1,
    shippingAddress2: wooApiOrder.shipping?.address_2,
    shippingPostcode: wooApiOrder.shipping?.postcode,
    shippingCity: wooApiOrder.shipping?.city,
    shippingCountry: wooApiOrder.shipping?.country,
    shippingEmail: wooApiOrder.billing?.email,
    shippingPhone: wooApiOrder.billing?.phone,
    customerNote: wooApiOrder.customer_note,
    specialRequest: "", // TODO: Resolve from parent subscription
    items,
    wooId: wooApiOrder.id,
    wooStatus: wooApiOrder.status,
    wooCustomerId: wooApiOrder.customer_id,
    wooCreatedDate: wooApiOrder.date_created,
    wooUpdatedDate: wooApiOrder.date_modified,
  };
};

export default wooApiToOrder;
