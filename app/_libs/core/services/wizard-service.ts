import type { Order } from '@prisma/client';
import { OrderType, ShippingType, SubscriptionType } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { getOrders } from '../models/order.server';

export type WizardOrdersSent = {
  orders: Order[];
  errors: string[];
};

export type WizardPreviewGroup = {
  totalCount: number;
  orders: {
    privates: {
      custom: {
        pickUp: Order[];
        ship: Order[];
      };
      renewal: {
        pickUp: Order[];
        ship: {
          ABO1: Order[];
          ABO2: Order[];
          ABO3: Order[];
          ABO4: Order[];
          ABO5: Order[];
          ABO6: Order[];
          ABO7: Order[];
        };
      };
    };
    b2bs: {};
  };
};

function filterPrivateAboQuantity(o: Order, quantity: number) {
  if (
    (o.type !== OrderType.RECURRING && o.type !== OrderType.NON_RECURRING) ||
    o.shippingType !== ShippingType.SHIP
  )
    return false;

  return o.quantity250 === quantity;
}

export async function generatePreview() {
  const orders = await getOrders({
    where: {
      status: OrderStatus.ACTIVE,
    },
    include: {
      orderItems: {
        select: {
          id: true,
          variation: true,
          quantity: true,
          coffee: true,
        },
      },
      subscription: {
        select: {
          type: true,
        },
      },
    },
  });

  const preview: WizardPreviewGroup = {
    totalCount: 0,
    orders: {
      privates: {
        custom: {
          pickUp: [],
          ship: [],
        },
        renewal: {
          pickUp: [],
          ship: {
            ABO1: [],
            ABO2: [],
            ABO3: [],
            ABO4: [],
            ABO5: [],
            ABO6: [],
            ABO7: [],
          },
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

  preview.orders.privates.custom.pickUp = privates.filter(
    (o) =>
      o.type === OrderType.CUSTOM &&
      o.shippingType === ShippingType.LOCAL_PICK_UP
  );

  preview.orders.privates.custom.ship = privates.filter(
    (o) => o.type === OrderType.CUSTOM && o.shippingType === ShippingType.SHIP
  );

  preview.orders.privates.renewal.pickUp = privates.filter(
    (o) =>
      (o.type === OrderType.RECURRING || o.type === OrderType.NON_RECURRING) &&
      o.shippingType === ShippingType.LOCAL_PICK_UP
  );

  // console.log(
  //   'preview.orders.privates.custom.ship',
  //   preview.orders.privates.custom.ship
  // );

  preview.orders.privates.renewal.ship.ABO1 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 1)
  );

  preview.orders.privates.renewal.ship.ABO2 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 2)
  );

  preview.orders.privates.renewal.ship.ABO3 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 3)
  );

  preview.orders.privates.renewal.ship.ABO4 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 4)
  );

  preview.orders.privates.renewal.ship.ABO5 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 5)
  );

  preview.orders.privates.renewal.ship.ABO6 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 6)
  );

  preview.orders.privates.renewal.ship.ABO7 = privates.filter((o) =>
    filterPrivateAboQuantity(o, 7)
  );

  preview.totalCount =
    preview.orders.privates.custom.pickUp.length +
    preview.orders.privates.custom.ship.length +
    preview.orders.privates.renewal.pickUp.length +
    preview.orders.privates.renewal.ship.ABO1.length +
    preview.orders.privates.renewal.ship.ABO2.length +
    preview.orders.privates.renewal.ship.ABO3.length +
    preview.orders.privates.renewal.ship.ABO4.length +
    preview.orders.privates.renewal.ship.ABO5.length +
    preview.orders.privates.renewal.ship.ABO6.length +
    preview.orders.privates.renewal.ship.ABO7.length;

  return preview;
}
