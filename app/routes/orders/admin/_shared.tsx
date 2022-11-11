import { json, redirect } from '@remix-run/node';

import { upsertOrder } from '~/_libs/core/models/order.server';

type ActionData =
  | {
      subscriptionId: null | string;
      deliveryId: null | string;
      status: null | string;
    }
  | undefined;

export const upsertAction = async (request: any) => {
  const formData = await request.formData();

  const id = +formData.get('id');
  const subscriptionId = +formData.get('subscriptionId');
  const deliveryId = +formData.get('deliveryId');
  const status = formData.get('status');

  const name = formData.get('name');
  const address1 = formData.get('address1');
  const address2 = formData.get('address2');
  const postalCode = formData.get('postalCode');
  const postalPlace = formData.get('postalPlace');
  const email = formData.get('email');
  const mobile = formData.get('mobile');

  const quantity250 = +formData.get('quantity250');
  const quantity500 = +formData.get('quantity500');
  const quantity1200 = +formData.get('quantity1200');

  const errors: ActionData = {
    subscriptionId: subscriptionId ? null : 'Subscription is required',
    deliveryId: deliveryId ? null : 'Delivery is required',
    status: status ? null : 'Status is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', errors);
    return json<ActionData>(errors);
  }

  const data = {
    subscriptionId,
    deliveryId,
    status,
    quantity250,
    quantity500,
    quantity1200,
    name,
    address1,
    address2,
    postalCode,
    postalPlace,
    email,
    mobile,
  };

  await upsertOrder({ ...data, id });

  return redirect(`/subscriptions/admin/${subscriptionId}`);
};
