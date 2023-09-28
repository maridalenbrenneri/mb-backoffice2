import type { Order } from '@prisma/client';
import { SubscriptionSpecialRequest } from '@prisma/client';
import { OrderType, ShippingType, SubscriptionType } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { getOrders } from '../repositories/order/order.server';
import {
  TAKE_MAX_ROWS,
  WOO_NON_RECURRENT_SUBSCRIPTION_ID,
  WOO_RENEWALS_SUBSCRIPTION_ID,
} from '../settings';

export type WizardOrdersSent = {
  orders: Order[];
  errors: string[];
};

export type WizardPreviewGroup = {
  totalCount: number;
  orders: {
    all: Order[];
    allSpecialRequets: Order[];
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
    b2bs: {
      custom: {
        pickUp: Order[];
        ship: Order[];
      };
      renewal: {
        pickUp: Order[];
        ship: Order[];
      };
    };
  };
};

function filterPrivateAboQuantity(o: Order, quantity: number) {
  if (
    (o.type !== OrderType.RENEWAL && o.type !== OrderType.NON_RENEWAL) ||
    o.shippingType !== ShippingType.SHIP
  )
    return false;

  return o.quantity250 === quantity;
}

function isSystemSubscription(subscriptionId: number) {
  return (
    subscriptionId === WOO_RENEWALS_SUBSCRIPTION_ID ||
    subscriptionId === WOO_NON_RECURRENT_SUBSCRIPTION_ID
  );
}

export async function generatePreview(deliveryIds: number[]) {
  const orders = await getOrders({
    where: {
      status: OrderStatus.ACTIVE,
      deliveryId: { in: deliveryIds },
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
          fikenContactId: true,
          specialRequest: true,
        },
      },
      delivery: {
        select: {
          id: true,
          date: true,
        },
      },
    },
    take: TAKE_MAX_ROWS,
  });

  const preview: WizardPreviewGroup = {
    totalCount: 0,
    orders: {
      all: [],
      allSpecialRequets: [],
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
      b2bs: {
        custom: {
          pickUp: [],
          ship: [],
        },
        renewal: {
          pickUp: [],
          ship: [],
        },
      },
    },
  };

  // PRIVATE

  const privates = orders.filter(
    (o) =>
      o.subscription.type === SubscriptionType.PRIVATE ||
      o.subscription.type === SubscriptionType.PRIVATE_GIFT
  );

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
      (o.type === OrderType.RENEWAL || o.type === OrderType.NON_RENEWAL) &&
      o.shippingType === ShippingType.LOCAL_PICK_UP
  );

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

  // B2B
  const b2bs = orders.filter(
    (o) =>
      o.subscription.type === SubscriptionType.B2B &&
      !isSystemSubscription(o.subscriptionId)
  );

  preview.orders.b2bs.custom.pickUp = b2bs.filter(
    (o) =>
      o.type === OrderType.CUSTOM &&
      o.shippingType === ShippingType.LOCAL_PICK_UP
  );

  preview.orders.b2bs.custom.ship = b2bs.filter(
    (o) => o.type === OrderType.CUSTOM && o.shippingType === ShippingType.SHIP
  );

  preview.orders.b2bs.renewal.pickUp = b2bs.filter(
    (o) =>
      (o.type === OrderType.RENEWAL || o.type === OrderType.NON_RENEWAL) &&
      o.shippingType === ShippingType.LOCAL_PICK_UP
  );

  preview.orders.b2bs.renewal.ship = b2bs.filter(
    (o) =>
      (o.type === OrderType.RENEWAL || o.type === OrderType.NON_RENEWAL) &&
      o.shippingType === ShippingType.SHIP
  );

  preview.orders.allSpecialRequets = orders.filter(
    (o) => o.subscription.specialRequest !== SubscriptionSpecialRequest.NONE
  );

  preview.orders.all = orders;

  // TOTAL
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
    preview.orders.privates.renewal.ship.ABO7.length +
    preview.orders.b2bs.custom.pickUp.length +
    preview.orders.b2bs.custom.ship.length +
    preview.orders.b2bs.renewal.pickUp.length +
    preview.orders.b2bs.renewal.ship.length;

  return preview;
}
