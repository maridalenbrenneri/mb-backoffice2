import { json, redirect } from '@remix-run/node';

import type { DeliveryUpsertData } from '~/_libs/core/models/delivery.server';
import { upsertDelivery } from '~/_libs/core/models/delivery.server';

type ActionData =
  | {
      date: null | string;
      type: null | string;
    }
  | undefined;

export const upsertAction = async (request: any) => {
  const formData = await request.formData();

  const id = +formData.get('id');
  const date = formData.get('delivery_date');
  const type = formData.get('delivery_type');
  const coffee1Id = +formData.get('coffee1');
  const coffee2Id = +formData.get('coffee2');
  const coffee3Id = +formData.get('coffee3');
  const coffee4Id = +formData.get('coffee4');

  const errors: ActionData = {
    date: date ? null : 'Date is required',
    type: type ? null : 'Type is required',
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    console.error('Errors in form', errors);
    return json<ActionData>(errors);
  }

  const data: DeliveryUpsertData = {
    date,
    type,
    coffee1Id: coffee1Id || null,
    coffee2Id: coffee2Id || null,
    coffee3Id: coffee3Id || null,
    coffee4Id: coffee4Id || null,
  };

  await upsertDelivery(id, data);

  return redirect(`/deliveries/admin/${id}`);
};
