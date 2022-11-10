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

export function getRoastOverview(counter: BagCounter) {
  const _250 = getCountByQuantity(counter._250);
  const _500 = getCountByQuantity(counter._500);
  const _1200 = getCountByQuantity(counter._1200);

  const weight = calculateWeightByCoffee(_250, _500, _1200);

  return { _250, _500, _1200, ...weight };
}
