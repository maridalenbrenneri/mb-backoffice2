import { json, redirect } from '@remix-run/node';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import {
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';

import { upsertSubscription } from '~/_libs/core/models/subscription.server';
import { isUnsignedInt } from '~/_libs/core/utils/numbers';

type ActionData =
  | {
      quantity250: null | string;
      quantity500: null | string;
      quantity1200: null | string;
    }
  | undefined;

export const renderTypes = (type: SubscriptionType = SubscriptionType.B2B) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`customer-label`}>Type</InputLabel>
      <Select
        labelId={`type-label`}
        defaultValue={type}
        sx={{ minWidth: 250 }}
        disabled
      >
        {Object.keys(SubscriptionType).map((type: any) => (
          <MenuItem value={type} key={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const renderStatus = (
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`status-label`}>Status</InputLabel>
      <Select
        labelId={`status-label`}
        name={`status`}
        defaultValue={status}
        sx={{ minWidth: 250 }}
      >
        {Object.keys(SubscriptionStatus).map((status: any) => (
          <MenuItem value={status} key={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const renderFrequency = (
  frequency: SubscriptionFrequency = SubscriptionFrequency.MONTHLY
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`frequency-label`}>Frequency</InputLabel>
      <Select
        labelId={`frequency-label`}
        name={`frequency`}
        defaultValue={frequency}
        sx={{ minWidth: 250 }}
      >
        {Object.keys(SubscriptionFrequency).map((freq: any) => (
          <MenuItem value={freq} key={freq}>
            {freq}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const upsertAction = async (values: any) => {
  const errors = {
    status: values.status ? null : 'Status is required',
    type: values.type ? null : 'Type is required',
    quantity250: isUnsignedInt(values.quantity250)
      ? null
      : 'Must be a number greater or equal to zero',
    quantity500: isUnsignedInt(values.quantity500)
      ? null
      : 'Must be a number greater or equal to zero',
    quantity1200: isUnsignedInt(values.quantity1200)
      ? null
      : 'Must be a number greater or equal to zero',
    name: values.recipientName ? null : 'Name is required',
    address1: values.recipientAddress1 ? null : 'Address1 is required',
    postalCode: values.recipientPostalCode ? null : 'Postal code is required',
    postalPlace: values.recipientPostalPlace ? null : 'Place is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', errors);
    return json<ActionData>(errors);
  }

  const id = +values.id;

  const data = {
    fikenContactId: values.fikenContactId || null,
    type: values.type,
    status: values.status,
    frequency: values.frequency,
    quantity250: +values.quantity250,
    quantity500: +values.quantity500,
    quantity1200: +values.quantity1200,
    internalNote: values.internalNote,
    recipientName: values.recipientName,
    recipientAddress1: values.recipientAddress1,
    recipientAddress2: values.recipientAddress2,
    recipientPostalCode: values.recipientPostalCode,
    recipientPostalPlace: values.recipientPostalPlace,
    recipientEmail: values.recipientEmail,
    recipientMobile: values.recipientMobile,
  };

  await upsertSubscription(id, data);

  //return redirect(`/subscriptions/admin/${id}`);
  return redirect('/subscriptions');
};

// export const upsertOrderAction = async (request: any) => {
//   const formData = await request.formData();

//   const id = +formData.get('id');
//   const subscriptionId = +formData.get('subscriptionId');
//   const deliveryId = +formData.get('deliveryId');
//   const type = formData.get('orderType');
//   const status = formData.get('status');

//   const name = formData.get('name');
//   const address1 = formData.get('address1');
//   const address2 = formData.get('address2');
//   const postalCode = formData.get('postalCode');
//   const postalPlace = formData.get('postalPlace');
//   const email = formData.get('email');
//   const mobile = formData.get('mobile');

//   const quantity250 = +formData.get('quantity250');
//   const quantity500 = +formData.get('quantity500');
//   const quantity1200 = +formData.get('quantity1200');
//   const internalNote = formData.get('internalNote');

//   const errors = {
//     quantity250: isUnsignedInt(quantity250)
//       ? null
//       : 'Must be a number greater or equal to zero',
//     quantity500: isUnsignedInt(quantity500)
//       ? null
//       : 'Must be a number greater or equal to zero',
//     quantity1200: isUnsignedInt(quantity1200)
//       ? null
//       : 'Must be a number greater or equal to zero',
//   };
//   const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
//   if (hasErrors) {
//     console.error('Errors in form', errors);
//     return json<ActionData>(errors);
//   }

//   const data = {
//     subscriptionId,
//     deliveryId,
//     type,
//     status,
//     quantity250,
//     quantity500,
//     quantity1200,
//     internalNote,
//     name,
//     address1,
//     address2,
//     postalCode,
//     postalPlace,
//     email,
//     mobile,
//   };

//   await upsertOrder(id, data);

//   return redirect('/subscriptions');
// };
