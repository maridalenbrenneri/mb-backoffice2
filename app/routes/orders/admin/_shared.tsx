import { json, redirect } from '@remix-run/node';

import type { OrderUpsertInput } from '~/_libs/core/models/order.server';
import { upsertOrderItem } from '~/_libs/core/models/order.server';
import { upsertOrder } from '~/_libs/core/models/order.server';
import { sendOrder } from '~/_libs/core/services/order-service';
import { isUnsignedInt } from '~/_libs/core/utils/numbers';

type ActionData =
  | {
      subscriptionId: null | string;
      deliveryId: null | string;
      status: null | string;
      quantity250: null | string;
      quantity500: null | string;
      quantity1200: null | string;
    }
  | undefined;

type OrderItemActionData =
  | {
      orderId: null | string;
      coffeeId: null | string;
      variation: null | string;
      quantity: null | string;
    }
  | undefined;

export const upsertAction = async (values: any) => {
  const errors: ActionData = {
    subscriptionId: values.subscriptionId ? null : 'Subscription is required',
    deliveryId: values.deliveryId ? null : 'Delivery is required',
    status: values.status ? null : 'Status is required',
    quantity250: isUnsignedInt(values.quantity250)
      ? null
      : 'Must be a number greater or equal to zero',
    quantity500: isUnsignedInt(values.quantity500)
      ? null
      : 'Must be a number greater or equal to zero',
    quantity1200: isUnsignedInt(values.quantity1200)
      ? null
      : 'Must be a number greater or equal to zero',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', errors);
    return json<ActionData>(errors);
  }

  const data = {
    name: values.name,
    address1: values.address1,
    address2: values.address2,
    postalCode: values.postalCode,
    postalPlace: values.postalPlace,
    email: values.email,
    mobile: values.mobile,
    subscriptionId: +values.subscriptionId,
    deliveryId: +values.deliveryId,
    quantity250: +values.quantity250,
    quantity500: +values.quantity500,
    quantity1200: +values.quantity1200,
  } as OrderUpsertInput;

  await upsertOrder(+values.id, data);

  return redirect(`/subscriptions/admin/${values.subscriptionId}`);
};

export const upsertOrderItemAction = async (values: any) => {
  const errors: OrderItemActionData = {
    orderId: values.orderId ? null : 'Order is required',
    coffeeId: values.coffeeId ? null : 'Coffee is required',
    variation: values.variation ? null : 'Variation is required',
    quantity: values.quantity ? null : 'Quantity is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', errors);
    return json<OrderItemActionData>(errors);
  }

  const input = {
    orderId: +values.orderId,
    coffeeId: +values.coffeeId,
    variation: values.variation,
    quantity: +values.quantity,
  } as any;

  console.log('INPUT', input);

  await upsertOrderItem(+values.id, input);

  return redirect(`/orders/admin/${values.orderId}`);
};

export const sendOrderAction = async (values: any) => {
  const result = await sendOrder(+values.id);
  console.debug('sendOrder RESULT', result);
  return null;
};
