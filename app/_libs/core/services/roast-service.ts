import type { Delivery, Order } from '@prisma/client';
import { OrderType } from '@prisma/client';
import type { BagCounter, BagCounterItem } from './subscription-stats';

function getCountByQuantity(counter: BagCounterItem) {
  const coffee1 =
    counter.one +
    counter.two +
    counter.three +
    counter.four +
    (counter.five > 0 ? counter.five * 2 : 0) +
    (counter.six > 0 ? counter.six * 2 : 0) +
    (counter.seven > 0 ? counter.seven * 2 : 0);

  const coffee2 =
    counter.two +
    counter.three +
    counter.four +
    counter.five +
    (counter.six > 0 ? counter.six * 2 : 0) +
    (counter.seven > 0 ? counter.seven * 2 : 0);

  const coffee3 =
    counter.three +
    counter.four +
    counter.five +
    (counter.six > 0 ? counter.six * 2 : 0) +
    (counter.seven > 0 ? counter.seven * 2 : 0);

  const coffee4 = counter.four + counter.five + counter.six + counter.seven;

  const total = coffee1 + coffee2 + coffee3 + coffee4;

  return { total, coffee1, coffee2, coffee3, coffee4 };
}

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

  let count = 1;
  let coffeeNo = 1;

  let coffee1 = 0;
  let coffee2 = 0;
  let coffee3 = 0;
  let coffee4 = 0;

  while (count <= quantity) {
    if (coffeeNo === 1) coffee1++;
    else if (coffeeNo === 2) coffee2++;
    else if (coffeeNo === 3) coffee3++;
    else if (coffeeNo === 4) coffee4++;

    coffeeNo++;
    count++;

    if (coffeeNo > NR_OF_COFFEES) coffeeNo = 1;
  }

  return { coffee1, coffee2, coffee3, coffee4 };
}

function fromItems(orders: Order[]) {
  const data = new Map();

  for (const order of orders) {
    for (const item of order.orderItems) {
      const row = data.get(item.coffeeId) || { _250: 0, _500: 0, _1200: 0 };

      if (item.variation === '_250') {
        row._250 += item.quantity;
        data.set(item.coffeeId, row);
      } else if (item.variation === '_500') {
        row._500 += item.quantity;
        data.set(item.coffeeId, row);
      } else if (item.variation === '_1200') {
        row._1200 += item.quantity;
        data.set(item.coffeeId, row);
      }
    }
  }

  return data;
}

function aggregateCoffeesFromNonRecurringOrders(orders: Order[]) {
  // get total count from all orders of each bag size
  let _250 = 0;
  let _500 = 0;
  let _1200 = 0;

  orders.map((o: Order) => (_250 += o.quantity250 || 0));
  orders.map((o: Order) => (_500 += o.quantity500 || 0));
  orders.map((o: Order) => (_1200 += o.quantity1200 || 0));

  return {
    _250: _agg(_250),
    _500: _agg(_500),
    _1200: _agg(_1200),
  };
}

// RESOLVES QUANTITES OF EACH COFFEE TYPES AND BAG SIZES
// COFFEES IN ORDERS FROM SELECTED DELIVERY IS INCLUDED.
// BASE IS A BAG COUNTER (CREATED FROM CURRENT ABO STATS IF STOR-ABO DELIVERY)
export function getRoastOverview(
  counter: BagCounter,
  delivery: Delivery | undefined = undefined
) {
  const _250 = getCountByQuantity(counter._250);
  const _500 = getCountByQuantity(counter._500);
  const _1200 = getCountByQuantity(counter._1200);

  const notSetOnDelivery: any[] = [];

  if (delivery?.orders?.length) {
    const nonRecurringOrders = delivery.orders.filter(
      (o: Order) => o.type === OrderType.NON_RECURRING
    );

    const customOrders = delivery.orders.filter(
      (o: Order) => o.type === OrderType.CUSTOM
    );

    if (nonRecurringOrders.length) {
      const aggOrders =
        aggregateCoffeesFromNonRecurringOrders(nonRecurringOrders);

      _250.coffee1 += aggOrders._250.coffee1;
      _250.coffee2 += aggOrders._250.coffee2;
      _250.coffee3 += aggOrders._250.coffee3;
      _250.coffee4 += aggOrders._250.coffee4;

      _500.coffee1 += aggOrders._500.coffee1;
      _500.coffee2 += aggOrders._500.coffee2;
      _500.coffee3 += aggOrders._500.coffee3;
      _500.coffee4 += aggOrders._500.coffee4;

      _1200.coffee1 += aggOrders._1200.coffee1;
      _1200.coffee2 += aggOrders._1200.coffee2;
      _1200.coffee3 += aggOrders._1200.coffee3;
      _1200.coffee4 += aggOrders._1200.coffee4;

      console.log('AGG', aggOrders);
    }

    if (customOrders.length) {
      const map = fromItems(customOrders);

      const list: number[] = [];
      let c1, c2, c3, c4;

      // ADD QUANTITIES TO COFFEES SET ON DELIVERY - LIST USED TO HANDLE WHEN SAME COFFEE IS SET MULTIPLE TIMES ON DELIVERY
      if (delivery.coffee1Id) {
        c1 = map.get(delivery.coffee1Id);
        list.push(delivery.coffee1Id);
      }

      if (delivery.coffee2Id && !list.some((l) => l === delivery.coffee2Id)) {
        c2 = map.get(delivery.coffee2Id);
        list.push(delivery.coffee2Id);
      }

      if (delivery.coffee3Id && !list.some((l) => l === delivery.coffee3Id)) {
        c3 = map.get(delivery.coffee3Id);
        list.push(delivery.coffee3Id);
      }

      if (delivery.coffee4Id && !list.some((l) => l === delivery.coffee4Id)) {
        c4 = map.get(delivery.coffee4Id);
        list.push(delivery.coffee4Id);
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
          key !== delivery.coffee1Id &&
          key !== delivery.coffee2Id &&
          key !== delivery.coffee3Id &&
          key !== delivery.coffee4Id
        ) {
          notSetOnDelivery.push({
            coffeeId: key,
            totalKg:
              (value._250 * 250 + value._500 * 500 + value._1200 * 1200) / 1000,
            _250: value._250,
            _500: value._500,
            _1200: value._1200,
          });
        }
      }
    }
  }

  const weight = calculateWeightByCoffee(_250, _500, _1200);

  return { _250, _500, _1200, ...weight, notSetOnDelivery };
}
