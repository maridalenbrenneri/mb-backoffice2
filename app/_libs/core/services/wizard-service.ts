import type { Order } from '@prisma/client';
import { OrderType, ShippingType, SubscriptionType } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { getOrders } from '../models/order.server';

export type WizardOrdersSent = {
  orders: Order[];
  errors: string[];
};

export type WizardPreviewGroup = {
  orders: {
    privates: {
      custom: {
        pickUp: number[];
        ship: number[];
      };
      renewal: {
        pickUp: number[];
        ship: number[];
      };
    };
    b2bs: {};
  };
};

export async function generatePreview() {
  const orders = await getOrders({
    where: {
      status: OrderStatus.ACTIVE,
    },
    include: {
      orderItems: true,
      subscription: {
        select: {
          type: true,
        },
      },
    },
  });

  const preview: WizardPreviewGroup = {
    orders: {
      privates: {
        custom: {
          pickUp: [],
          ship: [],
        },
        renewal: {
          pickUp: [],
          ship: [],
        },
      },
      b2bs: {},
    },
  };

  const privates = orders.filter(
    (o) =>
      o.subscription.type === SubscriptionType.PRIVATE ||
      SubscriptionType.PRIVATE_GIFT
  );

  //   const b2bs = orders.filter(
  //     (o) => o.subscription.type === SubscriptionType.B2B
  //   );

  preview.orders.privates.custom.pickUp = privates
    .filter(
      (o) =>
        o.type === OrderType.CUSTOM &&
        o.shippingType === ShippingType.LOCAL_PICK_UP
    )
    .map((o) => o.id);

  preview.orders.privates.custom.ship = privates
    .filter(
      (o) => o.type === OrderType.CUSTOM && o.shippingType === ShippingType.SHIP
    )
    .map((o) => o.id);

  preview.orders.privates.renewal.pickUp = privates
    .filter(
      (o) =>
        (o.type === OrderType.RECURRING ||
          o.type === OrderType.NON_RECURRING) &&
        o.shippingType === ShippingType.LOCAL_PICK_UP
    )
    .map((o) => o.id);

  preview.orders.privates.renewal.ship = privates
    .filter(
      (o) =>
        (o.type === OrderType.RECURRING ||
          o.type === OrderType.NON_RECURRING) &&
        o.shippingType === ShippingType.SHIP
    )
    .map((o) => o.id);

  return preview;
}
