import { json, redirect } from '@remix-run/node';

import { upsertOrder } from '~/_libs/core/models/order.server';
import { sendOrder } from '~/_libs/core/services/order-service';

type ActionData =
  | {
      subscriptionId: null | string;
      deliveryId: null | string;
      status: null | string;
    }
  | undefined;

export const upsertAction = async (values: any) => {
  const errors: ActionData = {
    subscriptionId: values.subscriptionId ? null : 'Subscription is required',
    deliveryId: values.deliveryId ? null : 'Delivery is required',
    status: values.status ? null : 'Status is required',
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
  };

  await upsertOrder({ ...data, id: +values.id });

  return redirect(`/subscriptions/admin/${values.subscriptionId}`);
};

export const sendOrderAction = async (values: any) => {
  const result = await sendOrder(+values.id);
  console.debug('sendOrder RESULT', result);
  return null;
};
