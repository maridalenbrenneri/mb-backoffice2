import type { ConsignmentInput } from './models';

const WEIGHT_NORMAL_BAG = 250;
const WEIGHT_PACKAGING = 150;

export const sendConsignment = async (input: ConsignmentInput) => {
  const order = input.order;

  if (!order) {
    throw new Error('Order was null');
  }

  let reference = '';
  let weight = 0;

  for (const item of order.orderItems) {
    reference = `${reference} ${item.quantity}${item.mbProductCode}`;
    weight += WEIGHT_NORMAL_BAG * item.quantity;
  }

  weight += WEIGHT_PACKAGING;

  const consigment = {
    reference,
    weight,
    shippingName: order.name,
    shippingAddress1: order.addressStreet1,
    shippingAddress2: order.addressStreet2,
    shippingPostcode: order.addressPostcode,
    shippingCity: order.addressPlace,
  };

  console.debug('SENDING ORDER TO CARGONIZER', consigment);
};
