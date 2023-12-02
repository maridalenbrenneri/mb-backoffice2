import { json, redirect } from '@remix-run/node';

import type { DeliveryUpsertData } from '~/_libs/core/repositories/delivery.server';
import { upsertDelivery } from '~/_libs/core/repositories/delivery.server';

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
  const product1Id = +formData.get('product1');
  const product2Id = +formData.get('product2');
  const product3Id = +formData.get('product3');
  const product4Id = +formData.get('product4');

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
    product1Id: product1Id || null,
    product2Id: product2Id || null,
    product3Id: product3Id || null,
    product4Id: product4Id || null,
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
