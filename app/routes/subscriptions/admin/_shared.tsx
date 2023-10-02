import { json, redirect } from '@remix-run/node';

import * as subscriptionRepository from '~/_libs/core/repositories/subscription';
import type { CreateSubscriptionData } from '~/_libs/core/repositories/subscription';
import { isEmpty } from '~/_libs/core/utils/are-equal';

import { isUnsignedInt, parseIntOrZero } from '~/_libs/core/utils/numbers';

type CreateActionData = {
  validationErrors?:
    | {
        status: null | string;
        type: null | string;
        frequency: null | string;
        shippingType: null | string;
        quantity250: null | string;
        quantity500: null | string;
        quantity1200: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

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

export const updateFirstDeliveryDate = async (values: any) => {
  const errors = {
    status: values.delivery_date ? null : 'FirstDeliveryDate is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', errors);
    return json<any>(errors);
  }

  const id = +values.id;
  await subscriptionRepository.updateFirstDeliveryDateOnGiftSubscription(
    id,
    values.delivery_date
  );
};

export const updateSpecialRequest = async (values: any) => {
  console.log('HELLO', values);
  await subscriptionRepository.update(+values.id, {
    specialRequest: values.specialRequest,
  });

  return json<SubscriptionActionData>({
    didUpdate: true,
    updateMessage: 'Special request was updated',
  });
};

export const updateInternalNote = async (values: any) => {
  await subscriptionRepository.update(+values.id, {
    internalNote: values.internalNote,
  });

  return json<SubscriptionActionData>({
    didUpdate: true,
    updateMessage: 'Internal note was updated',
  });
};

const validate = (values: any) => {
  return {
    status: values.status ? null : 'Status is required',
    type: values.type ? null : 'Type is required',
    frequency: values.frequency ? null : 'Frequency is required',
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
};

export const updateAction = async (values: any) => {
  const validationErrors = validate(values);

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<SubscriptionActionData>({ validationErrors });
  }

  const id = +values.id;

  const data: any = {};
  if (values.status !== undefined) data.status = values.status;
  if (values.type !== undefined) data.type = values.type;
  if (values.frequency !== undefined) data.frequency = values.frequency;
  if (values.shippingType !== undefined)
    data.shippingType = values.shippingType;
  if (values.quantity250 !== undefined)
    data.quantity250 = parseIntOrZero(values.quantity250);
  if (values.quantity500 !== undefined)
    data.quantity500 = parseIntOrZero(values.quantity500);
  if (values.quantity1200 !== undefined)
    data.quantity1200 = parseIntOrZero(values.quantity1200);
  if (values.specialRequest !== undefined)
    data.specialRequest = values.specialRequest;
  if (values.internalNote !== undefined)
    data.internalNote = values.internalNote;
  if (values.recipientName !== undefined)
    data.recipientName = values.recipientName;
  if (values.recipientAddress1 !== undefined)
    data.recipientAddress1 = values.recipientAddress1;
  if (values.recipientAddress2 !== undefined)
    data.recipientAddress2 = values.recipientAddress2;
  if (values.recipientPostalCode !== undefined)
    data.recipientPostalCode = values.recipientPostalCode;
  if (values.recipientPostalPlace !== undefined)
    data.recipientPostalPlace = values.recipientPostalPlace;
  if (values.recipientEmail !== undefined)
    data.recipientEmail = values.recipientEmail;
  if (values.recipientMobile !== undefined)
    data.recipientMobile = values.recipientMobile;
  if (values.isPrivateDeliveryAddress !== undefined)
    data.isPrivateDeliveryAddress = !!values.isPrivateDeliveryAddress;

  if (isEmpty(data)) {
    return json<SubscriptionActionData>({
      didUpdate: false,
      updateMessage: 'No changes were made',
    });
  }

  await subscriptionRepository.update(id, data);

  return json<SubscriptionActionData>({
    didUpdate: true,
    updateMessage: 'Subscription was updated',
  });
};

export const createAction = async (values: any) => {
  const validationErrors = validate(values);

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<CreateActionData>({ validationErrors });
  }

  const data: CreateSubscriptionData = {
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

  let res = await subscriptionRepository.create(data);

  return redirect(`/subscriptions/admin/${res.id}`);
};
