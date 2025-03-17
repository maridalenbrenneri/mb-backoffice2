import { OrderType } from '@prisma/client';
import { json, redirect } from '@remix-run/node';

import { isUnsignedInt, parseIntOrZero } from '~/_libs/core/utils/numbers';
import { OrderService } from '~/_services/order/order.service';

type OrderActionData = {
  validationErrors?:
    | {
        subscriptionId: null | string;
        deliveryId: null | string;
        status: null | string;
        type: null | string;
        shippingType: null | string;
        quantity250: null | string;
        quantity500: null | string;
        quantity1200: null | string;
        postalCode: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

type OrderItemActionData =
  | {
      orderId: null | string;
      productId: null | string;
      variation: null | string;
      quantity: null | string;
    }
  | undefined;

export const upsertOrderAction = async (values: any) => {
  const validationErrors = {
    subscriptionId: values.subscriptionId ? null : 'Subscription is required',
    deliveryId: values.deliveryId ? null : 'Delivery is required',
    status: values.status ? null : 'Status is required',
    type: values.type ? null : 'Type is required',
    shippingType: values.shippingType ? null : 'Shipping Type is required',
    postalCode: values.postalCode ? null : 'Postal code is required',
    quantity250:
      values.type === OrderType.CUSTOM || isUnsignedInt(values.quantity250)
        ? null
        : 'Must be a number greater or equal to zero',
    quantity500:
      values.type === OrderType.CUSTOM || isUnsignedInt(values.quantity500)
        ? null
        : 'Must be a number greater or equal to zero',
    quantity1200:
      values.type === OrderType.CUSTOM || isUnsignedInt(values.quantity1200)
        ? null
        : 'Must be a number greater or equal to zero',
  };

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', validationErrors);
    return json<OrderActionData>({ validationErrors });
  }

  const data = {
    status: values.status,
    type: values.type,
    shippingType: values.shippingType,
    subscriptionId: +values.subscriptionId,
    deliveryId: +values.deliveryId,
    name: values.name,
    address1: values.address1,
    address2: values.address2,
    postalCode: values.postalCode,
    postalPlace: values.postalPlace,
    email: values.email,
    mobile: values.mobile,
    quantity250: parseIntOrZero(values.quantity250),
    quantity500: parseIntOrZero(values.quantity500),
    quantity1200: parseIntOrZero(values.quantity1200),
    internalNote: values.internalNote,
  };

  let orderService = new OrderService();

  await orderService.upsertOrder(+values.id, data);

  return json<OrderActionData>({
    didUpdate: true,
    updateMessage: 'Order was updated',
  });
};

export const upsertOrderItemAction = async (values: any) => {
  const errors: OrderItemActionData = {
    orderId: values.orderId ? null : 'Order is required',
    productId: values.productId ? null : 'Product is required',
    variation: values.variation ? null : 'Variation is required',
    quantity: values.quantity ? null : 'Quantity is required',
  };

  if (Object.values(errors).some((errorMessage) => errorMessage)) {
    console.debug('Errors in form', errors);
    return json<OrderItemActionData>(errors);
  }

  const data = {
    orderId: +values.orderId,
    productId: +values.productId,
    variation: values.variation,
    quantity: +values.quantity,
  } as any;

  console.log('INPUT', data);

  let orderService = new OrderService();

  await orderService.upsertOrderItem(+values.id, data);

  return redirect(`/orders/admin/${values.orderId}`);
};
