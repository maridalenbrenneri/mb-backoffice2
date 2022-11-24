import { prisma } from '~/db.server';

import { Order, OrderItem, OrderStatus, ShippingType } from '@prisma/client';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../settings';

export type { Order };
export type OrderUpsertData = Pick<
  Order,
  | 'subscriptionId'
  | 'deliveryId'
  | 'shippingType'
  | 'type'
  | 'status'
  | 'name'
  | 'address1'
  | 'address2'
  | 'postalCode'
  | 'postalPlace'
  | 'email'
  | 'mobile'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'wooOrderId'
  | 'internalNote'
>;

export type OrderItemUpsertData = Pick<
  OrderItem,
  'orderId' | 'coffeeId' | 'variation' | 'quantity'
>;

export async function getOrders(filter?: any) {
  filter = filter || {
    include: {
      orderItems: true,
      delivery: true,
    },
  };

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  return prisma.order.findMany(filter);
}

export async function getOrder(filter: any) {
  if (!filter) return null;

  return await prisma.order.findFirst(filter);
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
  });
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function upsertOrder(id: number | null, data: OrderUpsertData) {
  return prisma.order.upsert({
    where: {
      id: id || 0,
    },
    update: data,
    create: {
      type: data.type,
      status: data.status,
      shippingType: data.shippingType || ShippingType.SHIP,
      subscriptionId: data.subscriptionId,
      deliveryId: data.deliveryId,
      name: data.name,
      address1: data.address1,
      address2: data.address2,
      postalCode: data.postalCode,
      postalPlace: data.postalPlace,
      email: data.email,
      mobile: data.mobile,
      quantity250: data.quantity250,
      quantity500: data.quantity500,
      quantity1200: data.quantity1200,
    },
  });
}

export async function upsertOrderItem(
  id: number | null,
  data: OrderItemUpsertData
) {
  return prisma.orderItem.upsert({
    where: {
      id: id || 0,
    },
    update: data,
    create: {
      orderId: data.orderId,
      coffeeId: data.coffeeId,
      quantity: data.quantity,
      variation: data.variation,
    },
  });
}

export async function upsertOrderFromWoo(
  wooOrderId: number,
  data: OrderUpsertData
) {
  return prisma.order.upsert({
    where: {
      wooOrderId,
    },
    update: {
      // WE ONLY UPDATE STATUS FROM WOO, NOTHING ELSE IS OVERWRITTEN
      status: data.status,
    },
    create: {
      wooOrderId,
      type: data.type,
      status: data.status,
      shippingType: data.shippingType,
      subscriptionId: data.subscriptionId,
      deliveryId: data.deliveryId,
      name: data.name,
      address1: data.address1,
      address2: data.address2,
      postalCode: data.postalCode,
      postalPlace: data.postalPlace,
      email: data.email,
      mobile: data.mobile,
      quantity250: data.quantity250,
      quantity500: 0,
      quantity1200: 0,
    },
  });
}

export async function upsertOrderItemFromWoo(
  wooOrderItemId: number,
  data: OrderItemUpsertData
) {
  return prisma.orderItem.upsert({
    where: {
      wooOrderItemId,
    },
    // WE NEVER UPDATE AN ORDER ITEM FROM WOO
    update: {},
    create: {
      wooOrderItemId,
      orderId: data.orderId,
      coffeeId: data.coffeeId,
      quantity: data.quantity,
      variation: data.variation,
    },
  });
}

export async function createOrders(orders: any[]) {
  return prisma.order.createMany({
    data: orders,
  });
}
