import { DateTime } from 'luxon';

import type { Delivery } from '@prisma/client';

import { getDelivery, upsertDelivery } from '../models/delivery.server';
import { getNextDeliveryDates } from '../utils/dates';

export async function getNextDelivery() {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 }).startOf('day');

  const delivery = await getDelivery({
    where: {
      date: {
        gte: today.toJSDate(),
        lt: nextweek.toJSDate(),
      },
    },
  });

  if (delivery) return delivery;

  // IF DELIVERY WASN'T FOUND, CREATE

  const nextDates = getNextDeliveryDates();

  const nextDelivery = await upsertDelivery(null, {
    date: nextDates[0].date.toJSDate(),
    type: nextDates[0].type,
    coffee1Id: null,
    coffee2Id: null,
    coffee3Id: null,
    coffee4Id: null,
  });

  return nextDelivery;
}

export function getNextDeliveryFromList(deliveries: Delivery[]) {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 }).startOf('day');

  return deliveries.find((d) => {
    const date = DateTime.fromISO(d.date.toString());
    return date >= today && date < nextweek;
  });
}
