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
    status: status ? null : 'Status is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', errors);
    return json<ActionData>(errors);
  }

  const data = {...values};

  await upsertOrder({ ...data, values.id });

  return redirect(`/subscriptions/admin/${values.subscriptionId}`);
};

export const sendOrderAction = async (values: any) => {
  console.log('SEND-ORDER', values.id);

  // const res = await sendOrder(id);
  // console.log('sendOrder res', res);

  return null;
};
