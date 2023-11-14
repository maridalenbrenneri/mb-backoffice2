import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { upsertCoffee } from '~/_libs/core/repositories/coffee.server';

type CoffeeActionData = {
  validationErrors?:
    | {
        status: null | string;
        name: null | string;
        productCode: null | string;
        country: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

const actionBase = async (request: any) => {
  const formData = await request.formData();

  const id = +formData.get('id');
  const name = formData.get('name');
  const status = formData.get('status');
  const productCode = formData.get('productCode');
  const country = formData.get('country');

  const validationErrors = {
    status: status ? null : 'Status is required',
    name: name ? null : 'Name is required',
    productCode: productCode ? null : 'Product code is required',
    country: country ? null : 'Country is required',
  };

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', validationErrors);
    return json<CoffeeActionData>({ validationErrors });
  }

  invariant(typeof name === 'string', 'name must be a string');
  invariant(typeof productCode === 'string', 'productCode must be a string');
  invariant(typeof country === 'string', 'country must be a string');

  const data = {
    name: name.trim(),
    productCode: productCode.trim(),
    country: country.trim(),
    status,
  };

  await upsertCoffee({ ...data, id });

  return json<CoffeeActionData>({
    didUpdate: true,
    updateMessage: 'Coffee was updated',
  });
};

export const upsertAction = async (request: any) => {
  return await actionBase(request);
};

export const createAction = async (request: any) => {
  await actionBase(request);
  return redirect(`/coffees`);
};
