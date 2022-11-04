import { json, redirect } from '@remix-run/node';

import { updateGiftSubscription } from '~/_libs/core/models/subscription.server';

// type ActionData =
//   | {
//       name: null | string;
//       address1: null | string;
//       address2: null | string;
//       postCode: null | string;
//       place: null | string;
//     }
//   | undefined;

export const updateGiftSubscriptionAction = async (request: any) => {
  const formData = await request.formData();

  const id = +formData.get('id');
  const recipientName = formData.get('name');
  const recipientStreet1 = formData.get('street1');
  const recipientStreet2 = formData.get('street2');
  const recipientPostcode = formData.get('postCode');
  const recipientPlace = formData.get('place');
  const recipientEmail = formData.get('email');
  const recipientMobile = formData.get('mobile');

  console.log('Form', id);
  console.log('Form', recipientName);

  const errors = {
    name: recipientName ? null : 'Name is required',
    address1: recipientStreet1 ? null : 'Street1 is required',
    postCode: recipientPostcode ? null : 'PostCode is required',
    place: recipientPlace ? null : 'Place is required',
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    console.debug('Errors in form', errors);
    return json<any>(errors);
  }

  const data = {
    recipientName,
    recipientStreet1,
    recipientStreet2,
    recipientPostcode,
    recipientPlace,
    recipientEmail,
    recipientMobile,
  };

  console.log('DATA', data);

  await updateGiftSubscription({ ...data, id });

  return redirect('/');
};
