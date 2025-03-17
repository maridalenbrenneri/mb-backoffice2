import { DateTime } from 'luxon';

import { getNextTuesday } from '../utils/dates';
import { DeliveryEntity } from '~/_services/delivery/delivery.entity';
import {
  OrderEntity,
  OrderStatus,
  OrderType,
} from '~/_services/order/order.entity';
import {
  SubscriptionEntity,
  SubscriptionFrequency,
  SubscriptionType,
} from '~/_services/subscription/subscription-entity';
import { ProductEntity } from '~/_services/product/product.entity';

function calculateWeightByCoffee(_250: any, _500: any, _1200: any) {
  const coffee1kg =
    (_250.coffee1 * 250 + _500.coffee1 * 500 + _1200.coffee1 * 1200) / 1000;
  const coffee2kg =
    (_250.coffee2 * 250 + _500.coffee2 * 500 + _1200.coffee2 * 1200) / 1000;
  const coffee3kg =
    (_250.coffee3 * 250 + _500.coffee3 * 500 + _1200.coffee3 * 1200) / 1000;
  const coffee4kg =
    (_250.coffee4 * 250 + _500.coffee4 * 500 + _1200.coffee4 * 1200) / 1000;

  const totalKg = coffee1kg + coffee2kg + coffee3kg + coffee4kg;

  return { coffee1kg, coffee2kg, coffee3kg, coffee4kg, totalKg };
}

function _agg(quantity: number) {
  const NR_OF_COFFEES = 4;

  let counter = 1;
  let currentCoffee = 1;
  let coffee1 = 0;
  let coffee2 = 0;
  let coffee3 = 0;
  let coffee4 = 0;

  while (counter <= quantity) {
    if (currentCoffee === 1) coffee1++;
    else if (currentCoffee === 2) coffee2++;
    else if (currentCoffee === 3) coffee3++;
    else if (currentCoffee === 4) coffee4++;

    currentCoffee++;
    counter++;

    if (currentCoffee > NR_OF_COFFEES) currentCoffee = 1;
  }

  return { coffee1, coffee2, coffee3, coffee4 };
}

function fromItems(orders: OrderEntity[]) {
  const data = new Map();

  for (const order of orders) {
    for (const item of order.orderItems) {
      const row = data.get(item.product.id) || { _250: 0, _500: 0, _1200: 0 };

      if (item.variation === '_250') {
        row._250 += item.quantity;
        data.set(item.product.id, row);
      } else if (item.variation === '_500') {
        row._500 += item.quantity;
        data.set(item.product.id, row);
      } else if (item.variation === '_1200') {
        row._1200 += item.quantity;
        data.set(item.product.id, row);
      }
    }
  }

  return data;
}

function aggregateCoffeesOrders(
  orders: OrderEntity[],
  _250: any,
  _500: any,
  _1200: any
) {
  orders.forEach((order) => {
    let agg = _agg(order.quantity250 || 0);
    _250.coffee1 += agg.coffee1;
    _250.coffee2 += agg.coffee2;
    _250.coffee3 += agg.coffee3;
    _250.coffee4 += agg.coffee4;

    agg = _agg(order.quantity500 || 0);
    _500.coffee1 += agg.coffee1;
    _500.coffee2 += agg.coffee2;
    _500.coffee3 += agg.coffee3;
    _500.coffee4 += agg.coffee4;

    agg = _agg(order.quantity1200 || 0);
    _1200.coffee1 += agg.coffee1;
    _1200.coffee2 += agg.coffee2;
    _1200.coffee3 += agg.coffee3;
    _1200.coffee4 += agg.coffee4;
  });
}

function aggregateCoffeesFromSubscriptions(
  subscriptions: SubscriptionEntity[],
  _250: any,
  _500: any,
  _1200: any
) {
  subscriptions.forEach((s) => {
    let agg = _agg(s.quantity250);
    _250.coffee1 += agg.coffee1;
    _250.coffee2 += agg.coffee2;
    _250.coffee3 += agg.coffee3;
    _250.coffee4 += agg.coffee4;

    agg = _agg(s.quantity500);
    _500.coffee1 += agg.coffee1;
    _500.coffee2 += agg.coffee2;
    _500.coffee3 += agg.coffee3;
    _500.coffee4 += agg.coffee4;

    agg = _agg(s.quantity1200);
    _1200.coffee1 += agg.coffee1;
    _1200.coffee2 += agg.coffee2;
    _1200.coffee3 += agg.coffee3;
    _1200.coffee4 += agg.coffee4;
  });

  return { _250, _500, _1200 };
}

function resolveCoffee(coffees: ProductEntity[], productId: number) {
  console.debug('resolveCoffee', productId);
  return coffees.find((c) => c.id === productId);
}

export function getRoastOverview(
  subscriptions: SubscriptionEntity[],
  delivery: DeliveryEntity | undefined = undefined,
  coffees: ProductEntity[] = []
) {
  if (!delivery)
    throw new Error('No delivery set, cannot resolve roast overview');

  let includedSubscriptionCount = 0;
  let includedOrderCount = 0;
  const coffeesFromCustomOrdersNotSetOnDelivery: any[] = [];
  const fortnigthlyPrivateOrdersOnDelivery: OrderEntity[] = [];

  let _250 = { coffee1: 0, coffee2: 0, coffee3: 0, coffee4: 0 };
  let _500 = { coffee1: 0, coffee2: 0, coffee3: 0, coffee4: 0 };
  let _1200 = { coffee1: 0, coffee2: 0, coffee3: 0, coffee4: 0 };

  // MAKE SURE WE ONLY USE ACTIVE AND COMPLETED ORDERS IN ESTIMATION
  const orders = delivery.orders.filter(
    (o: OrderEntity) =>
      o.status === OrderStatus.ACTIVE || o.status === OrderStatus.COMPLETED
  );

  console.log('delivery.orders', delivery.orders.length);
  console.log('orders', orders.length);

  // ADD MONTHLY SUBSCRIPTIONS (ESTIMATE, NOT FROM ACTUAL RENEWAL ORDERS)
  if (delivery.type === 'MONTHLY') {
    const monthlySubscriptions = subscriptions.filter(
      (s) =>
        s.frequency === SubscriptionFrequency.MONTHLY ||
        (s.frequency === SubscriptionFrequency.FORTNIGHTLY &&
          s.type === SubscriptionType.B2B)
    );

    const aggSubscriptions = aggregateCoffeesFromSubscriptions(
      monthlySubscriptions,
      _250,
      _500,
      _1200
    );

    _250 = aggSubscriptions._250;
    _500 = aggSubscriptions._500;
    _1200 = aggSubscriptions._1200;

    includedSubscriptionCount += monthlySubscriptions.length;

    console.debug('_250 AFTER monthly');
    console.table(_250);
  }

  // ADD MONTHLY_3RD SUBSCRIPTIONS (ESTIMATE, NOT FROM ACTUAL RENEWAL ORDERS)
  if (delivery.type === 'MONTHLY_3RD') {
    const monthly3rdSubscriptions = subscriptions.filter(
      (s) =>
        s.frequency === SubscriptionFrequency.MONTHLY_3RD ||
        (s.frequency === SubscriptionFrequency.FORTNIGHTLY &&
          s.type === SubscriptionType.B2B)
    );

    const aggSubscriptions = aggregateCoffeesFromSubscriptions(
      monthly3rdSubscriptions,
      _250,
      _500,
      _1200
    );

    _250 = aggSubscriptions._250;
    _500 = aggSubscriptions._500;
    _1200 = aggSubscriptions._1200;

    includedSubscriptionCount += monthly3rdSubscriptions.length;

    console.debug('_250 AFTER monthly3rd');
    console.table(_250);

    console.debug('_500 AFTER monthly3rd');
    console.table(_500);

    console.debug('_1200 AFTER monthly3rd');
    console.table(_1200);
  }

  // ADD PRIVATE FORTNIGHTLY (ESTIMATE BASED ON wooNextPaymentDate OR ACTUAL RENEWAL ORDERS IF EXISTS)
  const fortnightlyPrivate = subscriptions.filter(
    (s) =>
      s.frequency === SubscriptionFrequency.FORTNIGHTLY &&
      s.type === SubscriptionType.PRIVATE &&
      s.wooNextPaymentDate !== null
  );
  fortnightlyPrivate.forEach((s) => {
    // Exclude if renewal order exist on Delivery (renewal orders will be added below)
    const order = orders.find((o: OrderEntity) => o.subscription.id === s.id);
    if (order) {
      console.debug(
        'Subscription already has a renewal order on delivery',
        order.id
      );
      fortnigthlyPrivateOrdersOnDelivery.push(order);
      return;
    }

    // Should not happen, just to make ESLint happy
    if (!s.wooNextPaymentDate) return;

    const next = DateTime.fromISO(s.wooNextPaymentDate.toString());
    const nextRenewalDate = getNextTuesday(next);

    const deliveryDate = DateTime.fromISO(delivery.date.toString());
    if (deliveryDate.hasSame(nextRenewalDate, 'day')) {
      const aggSubscriptions = aggregateCoffeesFromSubscriptions(
        [s],
        _250,
        _500,
        _1200
      );

      _250 = aggSubscriptions._250;
      _500 = aggSubscriptions._500;
      _1200 = aggSubscriptions._1200;

      includedSubscriptionCount++;

      console.debug('_250 AFTER fortnightlyPrivate');
      console.table(_250);
    }
  });

  // ADD FORTNIGHTLY ABO ORDERS (THOSE EXCLUDED FROM nextPaymentDate ESTIMATE ABOVE)
  console.debug(
    'ROAST OVERVIEW: fortnigthlyPrivateOrdersOnDelivery',
    fortnigthlyPrivateOrdersOnDelivery.length
  );
  if (fortnigthlyPrivateOrdersOnDelivery.length) {
    console.debug('_250 BEFORE fortnigthlyPrivateOrdersOnDelivery');
    console.table(_250);

    aggregateCoffeesOrders(
      fortnigthlyPrivateOrdersOnDelivery,
      _250,
      _500,
      _1200
    );

    includedOrderCount += fortnigthlyPrivateOrdersOnDelivery.length;

    console.debug('_250 AFTER fortnigthlyPrivateOrdersOnDelivery');
    console.table(_250);
  }

  // ADD NON-RENEWAL ORDERS TO OVERVIEW (FROM PASSIVE SUBSCRIPTIONS OR MANUALLY CREATED ORDERS ON ACTIVE SUBSCRIPTIONS)
  const nonRecurringOrders = orders.filter(
    (o: OrderEntity) => o.type === OrderType.NON_RENEWAL
  );
  if (nonRecurringOrders.length) {
    aggregateCoffeesOrders(nonRecurringOrders, _250, _500, _1200);

    includedOrderCount += nonRecurringOrders.length;

    console.debug('_250 AFTER nonRecurring');
    console.table(_250);

    console.debug('_500 AFTER nonRecurring');
    console.table(_500);

    console.debug('_1200 AFTER nonRecurring');
    console.table(_1200);
  }

  // ADD CUSTOM ORDERS
  const customOrders = orders.filter(
    (o: OrderEntity) => o.type === OrderType.CUSTOM
  );
  if (customOrders.length) {
    const map = fromItems(customOrders);

    const list: number[] = [];
    let c1, c2, c3, c4;

    console.debug('delivery', delivery);

    // ADD QUANTITIES TO COFFEES SET ON DELIVERY - LIST USED TO HANDLE WHEN SAME COFFEE IS SET MULTIPLE TIMES ON DELIVERY
    if (delivery.product1?.id) {
      c1 = map.get(delivery.product1.id);
      list.push(delivery.product1.id);
    }

    if (delivery.product2.id && !list.some((l) => l === delivery.product2.id)) {
      c2 = map.get(delivery.product2.id);
      list.push(delivery.product2.id);
    }

    if (
      delivery.product3?.id &&
      !list.some((l) => l === delivery.product3.id)
    ) {
      c3 = map.get(delivery.product3.id);
      list.push(delivery.product3.id);
    }

    if (
      delivery.product4?.id &&
      !list.some((l) => l === delivery.product4.id)
    ) {
      c4 = map.get(delivery.product4.id);
      list.push(delivery.product4.id);
    }

    _250.coffee1 += c1?._250 || 0;
    _250.coffee2 += c2?._250 || 0;
    _250.coffee3 += c3?._250 || 0;
    _250.coffee4 += c4?._250 || 0;

    _500.coffee1 += c1?._500 || 0;
    _500.coffee2 += c2?._500 || 0;
    _500.coffee3 += c3?._500 || 0;
    _500.coffee4 += c4?._500 || 0;

    _1200.coffee1 += c1?._1200 || 0;
    _1200.coffee2 += c2?._1200 || 0;
    _1200.coffee3 += c3?._1200 || 0;
    _1200.coffee4 += c4?._1200 || 0;

    // ADD QUANTITIES TO COFFEES NOT SET ON DELIVERY
    for (const [key, value] of map.entries()) {
      if (
        key !== delivery.product1?.id &&
        key !== delivery.product2?.id &&
        key !== delivery.product3?.id &&
        key !== delivery.product4?.id
      ) {
        const coffee = resolveCoffee(coffees, key);
        console.debug('coffee', coffee);
        coffeesFromCustomOrdersNotSetOnDelivery.push({
          productId: key,
          productCode: coffee?.productCode || `${key}`,
          totalKg:
            (value._250 * 250 + value._500 * 500 + value._1200 * 1200) / 1000,
          _250: value._250,
          _500: value._500,
          _1200: value._1200,
        });
      }
    }

    includedOrderCount += customOrders.length;

    console.debug('_250 AFTER custom');
    console.table(_250);

    console.debug('_500 AFTER custom');
    console.table(_500);

    console.debug('_1200 AFTER custom');
    console.table(_1200);
  }

  const weight = calculateWeightByCoffee(_250, _500, _1200);

  console.debug(
    'coffeesFromCustomOrdersNotSetOnDelivery',
    coffeesFromCustomOrdersNotSetOnDelivery
  );

  return {
    _250,
    _500,
    _1200,
    ...weight,
    notSetOnDelivery: coffeesFromCustomOrdersNotSetOnDelivery,
    includedSubscriptionCount,
    includedOrderCount,
  };
}
