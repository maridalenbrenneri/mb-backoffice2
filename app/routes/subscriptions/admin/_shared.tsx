import { json, redirect } from '@remix-run/node';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import {
  ShippingType,
  SubscriptionFrequency,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';

import { updateFirstDeliveryDateOnSubscription } from '~/_libs/core/models/subscription.server';
import { upsertSubscription } from '~/_libs/core/models/subscription.server';
import { isUnsignedInt, parseIntOrZero } from '~/_libs/core/utils/numbers';

type SubscriptionActionData = {
  validationErrors?:
    | {
        status: null | string;
        type: null | string;
        shippingType: null | string;
        quantity250: null | string;
        quantity500: null | string;
        quantity1200: null | string;
        recipientName: null | string;
        recipientAddress1: null | string;
        recipientPostalCode: null | string;
        recipientPostalPlace: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

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

export const renderShippingTypes = (
  shippingType: ShippingType = ShippingType.SHIP
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`shipping-type-label`}>Shipping type</InputLabel>
      <Select
        labelId={`shipping-type-label`}
        name={`shippingType`}
        defaultValue={shippingType}
        sx={{ minWidth: 250 }}
        size="small"
      >
        {Object.keys(ShippingType).map((type: any) => (
          <MenuItem value={type} key={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export const updateFirstDeliveryDate = async (values: any) => {
  console.debug('updateFirstDeliveryDate', values);
  const errors = {
    status: values.delivery_date ? null : 'FirstDeliveryDate is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', errors);
    return json<any>(errors);
  }

  const id = +values.id;
  await updateFirstDeliveryDateOnSubscription(id, values.delivery_date);
};

const actionBase = async (values: any) => {
  const validationErrors = {
    status: values.status ? null : 'Status is required',
    type: values.type ? null : 'Type is required',
    shippingType: values.shippingType ? null : 'Shipping type is required',
    quantity250: isUnsignedInt(values.quantity250)
      ? null
      : 'Must be a number greater or equal to zero',
    quantity500: isUnsignedInt(values.quantity500)
      ? null
      : 'Must be a number greater or equal to zero',
    quantity1200: isUnsignedInt(values.quantity1200)
      ? null
      : 'Must be a number greater or equal to zero',
    recipientName: values.recipientName ? null : 'Name is required',
    recipientAddress1: values.recipientAddress1 ? null : 'Address1 is required',
    recipientPostalCode: values.recipientPostalCode
      ? null
      : 'Postal code is required',
    recipientPostalPlace: values.recipientPostalPlace
      ? null
      : 'Place is required',
  };

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<SubscriptionActionData>({ validationErrors });
  }

  const id = +values.id;

  const data = {
    fikenContactId: values.fikenContactId,
    type: values.type,
    status: values.status,
    shippingType: values.shippingType,
    frequency: values.frequency,
    quantity250: parseIntOrZero(values.quantity250),
    quantity500: parseIntOrZero(values.quantity500),
    quantity1200: parseIntOrZero(values.quantity1200),
    specialRequest: values.specialRequest,
    internalNote: values.internalNote,
    wooCustomerName: values.customerName,
    recipientName: values.recipientName,
    recipientAddress1: values.recipientAddress1,
    recipientAddress2: values.recipientAddress2,
    recipientPostalCode: values.recipientPostalCode,
    recipientPostalPlace: values.recipientPostalPlace,
    recipientEmail: values.recipientEmail,
    recipientMobile: values.recipientMobile,
    isPrivateDeliveryAddress: !!values.isPrivateDeliveryAddress,
  };

  await upsertSubscription(id, data);

  return json<SubscriptionActionData>({
    didUpdate: true,
    updateMessage: 'Subscription was updated',
  });
};

export const upsertAction = async (request: any) => {
  return await actionBase(request);
};

export const createAction = async (request: any) => {
  await actionBase(request);
  return redirect(`/subscriptions`);
};
