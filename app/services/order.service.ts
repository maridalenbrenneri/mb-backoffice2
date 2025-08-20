import { ensureDataSourceInitialized } from '~/typeorm/data-source';
import { OrderEntity, OrderItemEntity } from '~/services/entities';
import {
  OrderStatus,
  OrderType,
  SubscriptionType,
  SubscriptionSpecialRequest,
  ShippingType,
} from '~/services/entities';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '~/settings';
import { COMPLETE_ORDERS_DELAY, WEIGHT_STANDARD_PACKAGING } from '~/settings';
import { printConsignmentLabels, sendConsignment } from '~/_libs/cargonizer';
import * as woo from '~/_libs/woo';
import {
  WOO_STATUS_CANCELLED,
  WOO_STATUS_COMPLETED,
  WOO_STATUS_PROCESSING,
} from '~/_libs/woo/constants';
import { resolveSpecialRequestCode } from '~/services/subscription.service';
import { getNextOrCreateDelivery } from '~/services/delivery.service';
import { getSubscription } from '~/services/subscription.service';

export type { OrderEntity as Order };

export interface Quantites {
  _250: number;
  _500: number;
  _1200: number;
}

export type OrderItemUpsertData = Pick<
  OrderItemEntity,
  'orderId' | 'productId' | 'variation' | 'quantity'
>;

async function getOrderRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(OrderEntity);
}

async function getOrderItemRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(OrderItemEntity);
}

// Repository functions
export async function getOrders(filter?: any) {
  filter = filter || {};

  const options: any = {};

  // Handle include to relations conversion if needed
  if (filter.include) {
    // Convert include object to relations array
    const relations: string[] = [];
    Object.keys(filter.include).forEach((key) => {
      relations.push(key);
    });
    options.relations = relations;
  } else if (filter.relations) {
    options.relations = filter.relations;
  }

  // Copy other filter properties
  if (filter.where) options.where = filter.where;
  if (filter.orderBy) options.order = filter.orderBy; // TypeORM uses 'order' not 'orderBy'
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!options.order) options.order = { updatedAt: 'desc' };
  if (!options.take || options.take > TAKE_MAX_ROWS)
    options.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  const repo = await getOrderRepo();
  return repo.find(options);
}

export async function getOrder(filter: any) {
  if (!filter) return null;

  const options: any = {};

  // Handle include to relations conversion if needed
  if (filter.include) {
    // Convert include object to relations array
    const relations: string[] = [];
    Object.keys(filter.include).forEach((key) => {
      relations.push(key);
    });
    options.relations = relations;
  } else if (filter.relations) {
    options.relations = filter.relations;
  }

  // Copy other filter properties
  if (filter.where) options.where = filter.where;
  if (filter.orderBy) options.order = filter.orderBy; // TypeORM uses 'order' not 'orderBy'
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  const repo = await getOrderRepo();
  return repo.findOne(options);
}

export async function getOrderById(id: number) {
  const repo = await getOrderRepo();
  return repo.findOne({ where: { id } });
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const repo = await getOrderRepo();
  const entity = await repo.preload({ id, status } as any);
  if (!entity) return null;
  return await repo.save(entity);
}

export async function updateOrder(id: number, data: any) {
  const repo = await getOrderRepo();
  const entity = await repo.preload({ id, ...(data as any) } as any);
  if (!entity) return null;
  return await repo.save(entity);
}

export async function upsertOrder(id: number | null, data: any) {
  const repo = await getOrderRepo();
  if (id) {
    const entity = await repo.preload({ id, ...(data as any) } as any);
    if (!entity) return null;
    return await repo.save(entity);
  } else {
    const entity = repo.create({
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
      trackingUrl: data.trackingUrl,
    });
    return await repo.save(entity);
  }
}

export async function upsertOrderItem(
  id: number | null,
  data: OrderItemUpsertData
) {
  const repo = await getOrderItemRepo();
  if (id) {
    const entity = await repo.preload({ id, ...(data as any) } as any);
    if (!entity) return null;
    return await repo.save(entity);
  } else {
    const entity = repo.create({
      orderId: data.orderId,
      productId: data.productId,
      quantity: data.quantity,
      variation: data.variation,
    });
    return await repo.save(entity);
  }
}

export async function upsertOrderFromWoo(
  wooOrderId: number,
  data: OrderEntity
): Promise<
  | { result: 'updated' | 'new' | 'notChanged'; orderId: number }
  | { result: 'ignored' }
> {
  const repo = await getOrderRepo();
  const existing = await repo.findOne({
    where: { wooOrderId },
  });

  // WE ONLY UPDATE STATUS FROM WOO ON EXISTING ORDERS, NOTHING ELSE IS OVERWRITTEN
  if (existing) {
    if (existing.status !== data.status) {
      const entity = await repo.preload({
        id: existing.id,
        status: data.status,
      } as any);
      if (entity) {
        await repo.save(entity);
      }
      return { result: 'updated', orderId: existing.id };
    } else {
      return { result: 'notChanged', orderId: existing.id };
    }
  }

  console.debug(
    'Creating order from woo',
    data.subscriptionId,
    data.wooOrderId,
    data.wooOrderNumber,
    data.status
  );

  // NEVER INSERT NOT ACTIVE ORDERS
  if (data.status !== OrderStatus.ACTIVE) {
    console.debug(
      "Upsert Order From Woo: Order does not exist and not active, won't create",
      data.wooOrderId,
      data.status
    );
    return { result: 'ignored' };
  }

  const entity = repo.create({
    wooOrderId,
    wooCreatedAt: data.wooCreatedAt,
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
    customerNote: data.customerNote,
  });

  const order = await repo.save(entity);
  return { result: 'new', orderId: order.id };
}

export async function upsertOrderItemFromWoo(
  wooOrderItemId: number,
  data: OrderItemUpsertData
) {
  const repo = await getOrderItemRepo();
  const existing = await repo.findOne({
    where: { wooOrderItemId },
  });

  // WE NEVER UPDATE AN ORDER ITEM FROM WOO
  if (existing) return existing;

  const entity = repo.create({
    wooOrderItemId,
    orderId: data.orderId,
    productId: data.productId,
    quantity: data.quantity,
    variation: data.variation,
  });

  return await repo.save(entity);
}

export async function createOrders(orders: any[]) {
  const repo = await getOrderRepo();
  return repo.save(orders);
}

// Service functions
async function _createOrder(
  subscriptionId: number,
  type: OrderType,
  quantities: Quantites | null = {
    _250: 0,
    _500: 0,
    _1200: 0,
  }
): Promise<OrderEntity> {
  const subscription = await getSubscription({
    where: { id: subscriptionId },
    relations: {
      orders: {
        relations: {
          delivery: true,
          orderItems: true,
        },
      },
    },
  });

  if (!subscription) {
    console.warn(
      `[order-service] The subscription was not found, cannot create order. Subscription id: ${subscriptionId}`
    );
    throw new Error('Failed to create order, subscription was not found');
  }

  if (type !== OrderType.CUSTOM && !quantities) {
    // DEFAULT TO SUBSCRIPTION QUANTITIES
    quantities = {
      _250: subscription.quantity250,
      _500: subscription.quantity500,
      _1200: subscription.quantity1200,
    };
  }

  const delivery = await getNextOrCreateDelivery();

  const order = await upsertOrder(null, {
    subscriptionId,
    deliveryId: delivery.id,
    status: OrderStatus.ACTIVE,
    shippingType: subscription.shippingType,
    type,
    name: subscription.recipientName,
    address1: subscription.recipientAddress1,
    address2: subscription.recipientAddress2,
    postalCode: subscription.recipientPostalCode,
    postalPlace: subscription.recipientPostalPlace,
    email: subscription.recipientEmail,
    mobile: subscription.recipientMobile,
    quantity250: quantities?._250 || 0,
    quantity500: quantities?._500 || 0,
    quantity1200: quantities?._1200 || 0,
  });

  if (!order) throw new Error('Failed to create order');

  return order;
}

export async function createNonRecurringOrder(
  subscriptionId: number,
  quantities: Quantites
) {
  return await _createOrder(subscriptionId, OrderType.NON_RENEWAL, quantities);
}

export async function createCustomOrder(subscriptionId: number) {
  return await _createOrder(subscriptionId, OrderType.CUSTOM);
}

export function calculateWeight(
  order: OrderEntity,
  includePackaging: boolean = true
) {
  let weight = 0;

  for (const item of order.orderItems) {
    if (item.variation === '_250') weight += 250 * item.quantity;
    if (item.variation === '_500') weight += 500 * item.quantity;
    if (item.variation === '_1200') weight += 1200 * item.quantity;
  }

  if (order.quantity250) weight += 250 * order.quantity250;
  if (order.quantity500) weight += 500 * order.quantity500;
  if (order.quantity1200) weight += 1200 * order.quantity1200;

  if (includePackaging) weight += WEIGHT_STANDARD_PACKAGING;

  return weight;
}

export function resolveSource(order: OrderEntity) {
  if (order.wooOrderId) return `woo`;

  if (order.subscription?.type === SubscriptionType.B2B) return 'b2b';
  if (order.subscription?.type === SubscriptionType.PRIVATE_GIFT) return 'gabo';

  return 'n/a';
}

export function generateReference(order: OrderEntity) {
  let reference = '';

  if (order.orderItems) {
    for (const item of order.orderItems) {
      let productCode = item.product?.productCode || 'n/a';

      if (item.variation === '_250')
        reference = `${reference} ${item.quantity}${productCode}`;
      if (item.variation === '_500')
        reference = `${reference} ${item.quantity}${productCode}x500g`;
      if (item.variation === '_1200')
        reference = `${reference} ${item.quantity}${productCode}x1.2kg`;
    }
  }

  if (order.quantity250) reference = `${reference} ABO${order.quantity250}`;

  if (order.quantity500)
    reference = `${reference} ABO${order.quantity500}x500g`;

  if (order.quantity1200)
    reference = `${reference} ABO${order.quantity1200}x1,2kg`;

  if (
    order.subscription &&
    order.subscription.specialRequest !== SubscriptionSpecialRequest.NONE
  )
    reference = `${reference} ${resolveSpecialRequestCode(
      order.subscription.specialRequest
    )}`;

  return reference;
}

async function getOrderFromDb(orderId: number) {
  return await getOrder({
    where: {
      id: orderId,
    },
    relations: {
      subscription: true,
      orderItems: {
        relations: {
          product: true,
        },
      },
    },
  });
}

// COMPLETE IN MB AND WOO, CREATE CONSIGNMENT IN CARGONIZER
async function completeAndShipOrder(orderId: number, results: any[]) {
  let error;
  let cargonizer;
  let wooResult;

  let isCompletedInWoo = false;
  let isTransferedToCargonizer = false;

  try {
    const order = await getOrderFromDb(orderId);

    if (!order) {
      console.warn(
        `[order-service] The order requested to be sent was not found, order id: ${orderId}`
      );
      return;
    }

    if (order.wooOrderId) {
      wooResult = await woo.orderUpdateStatus(
        order.wooOrderId,
        WOO_STATUS_COMPLETED
      );

      if (wooResult.error) {
        console.warn(wooResult.error);
        throw new Error('Failed to complete order in Woo');
      }

      isCompletedInWoo = true;
    }

    if (order.shippingType !== ShippingType.LOCAL_PICK_UP) {
      cargonizer = await sendConsignment({
        order,
      });

      if (cargonizer?.error) {
        console.warn(cargonizer.error);
        throw new Error('Failed to create consignment in Cargonizer');
      }

      isTransferedToCargonizer = true;
    }

    await updateOrder(order.id, {
      status: OrderStatus.COMPLETED,
      trackingUrl: cargonizer?.trackingUrl || null,
    });
  } catch (err: any) {
    error = err.message;
  }

  results.push({
    result: !error ? 'Success' : 'Failed',
    error,
    orderId,
    isCompletedInWoo,
    isTransferedToCargonizer,
    cargonizerConsignmentId: cargonizer?.consignmentId || null,
    cargonizerTrackingUrl: cargonizer?.trackingUrl || null,
    wooOrderId: wooResult?.orderId || null,
    wooOrderStatus: wooResult?.orderStatus || null,
  });
}

export async function completeAndShipOrders(
  orderIds: number[],
  printLabels = false
) {
  const MAX_CONCURRANT_REQUESTS = 5;

  if (!orderIds.length) return [];

  const delay = () =>
    new Promise((resolve) => setTimeout(resolve, COMPLETE_ORDERS_DELAY));

  const result: {
    orderResult: any[];
    printErrors: any;
  } = {
    orderResult: [],
    printErrors: null,
  };

  let promises: Promise<void>[] = [];

  let requestCounter = 1;
  for (const orderId of orderIds) {
    promises.push(completeAndShipOrder(orderId, result.orderResult));

    if (requestCounter >= MAX_CONCURRANT_REQUESTS) {
      await Promise.all(promises);

      promises = [];
      requestCounter = 0;

      await delay();
    }

    requestCounter++;
  }

  // Wait for any remaining requests
  if (promises.length) {
    await Promise.all(promises);
  }

  if (printLabels) {
    const ids = result.orderResult
      .filter((r) => r.result === 'Success' && r.consignmentId)
      .map((r) => r.consignmentId);

    const printResult = await printConsignmentLabels(ids);

    if (printResult.error) {
      result.printErrors = `Error when printing labels. All orders were most likely created as consignments in Cargonizer but print of one or many labels failed. Err message: "${printResult.error}"`;
    }
  }

  console.debug('Errors: ', result.printErrors);
  console.table(result.orderResult);

  return result;
}

export async function completeOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.orderUpdateStatus(order.wooOrderId, WOO_STATUS_COMPLETED);
  }
  await updateOrderStatus(order.id, OrderStatus.COMPLETED);
}

export async function cancelOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.orderUpdateStatus(order.wooOrderId, WOO_STATUS_CANCELLED);
  }
  await updateOrderStatus(order.id, OrderStatus.CANCELLED);
}

export async function activateOrder(orderId: number) {
  const order = await getOrderFromDb(orderId);
  if (!order) return;

  if (order.wooOrderId) {
    await woo.orderUpdateStatus(order.wooOrderId, WOO_STATUS_PROCESSING);
  }
  await updateOrderStatus(order.id, OrderStatus.ACTIVE);
}
