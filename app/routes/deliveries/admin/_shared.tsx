import { json, redirect } from '@remix-run/node';

import type { DeliveryUpsertData } from '~/_libs/core/models/delivery.server';
import { upsertDelivery } from '~/_libs/core/models/delivery.server';

type DeliveryActionData = {
  validationErrors?:
    | {
        date: null | string;
        type: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

const actionBase = async (request: any) => {
  const formData = await request.formData();

  const id = +formData.get('id');
  const date = formData.get('delivery_date');
  const type = formData.get('delivery_type');
  const coffee1Id = +formData.get('coffee1');
  const coffee2Id = +formData.get('coffee2');
  const coffee3Id = +formData.get('coffee3');
  const coffee4Id = +formData.get('coffee4');

  const validationErrors = {
    date: date ? null : 'Date is required',
    type: type ? null : 'Type is required',
  };

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<DeliveryActionData>({ validationErrors });
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

  return json<DeliveryActionData>({
    didUpdate: true,
    updateMessage: 'Delivery day was updated',
  });
};

export const upsertAction = async (request: any) => {
  return await actionBase(request);
};

export const createAction = async (request: any) => {
  await actionBase(request);
  return redirect(`/deliveries`);
};
