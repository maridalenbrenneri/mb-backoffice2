import { json, redirect } from '@remix-run/node';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import {
  ShippingType,
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';

import { upsertSubscription } from '~/_libs/core/models/subscription.server';
import {
  isUnsignedInt,
  parseIntOrNull,
  parseIntOrZero,
} from '~/_libs/core/utils/numbers';

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
        size="small"
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
        size="small"
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
        size="small"
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

function validateQuantities(values: any) {}

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
    fikenContactId: parseIntOrNull(values.fikenContactId),
    type: values.type,
    status: values.status,
    shippingType: ShippingType.SHIP,
    frequency: values.frequency,
    quantity250: parseIntOrZero(values.quantity250),
    quantity500: parseIntOrZero(values.quantity500),
    quantity1200: parseIntOrZero(values.quantity1200),
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
