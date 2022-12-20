import { DateTime } from 'luxon';

import type { Delivery } from '@prisma/client';

import { getDelivery, upsertDelivery } from '../models/delivery.server';
import { getNextDeliveryDateFrom } from '../utils/dates';

// RESOLVES NEXT DELIVERY FROM TODAY OR THE DATE SPECIFIED. IF DELIVERY DOESN'T EXIST, IT IS CREATED
export async function getNextOrCreateDelivery(): Promise<Delivery> {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 });

  const delivery = await getDelivery({
    where: {
      date: {
        gte: today.toJSDate(),
        lt: nextweek.toJSDate(),
      },
    },
  });

  console.debug(
    'GET OR CREATE DELIVERY DAY, delivery found: ',
    delivery?.date,
    delivery?.type
  );

  if (delivery) return delivery;

  // DELIVERY NOT FOUND, CREATE

  const nextDate = getNextDeliveryDateFrom(today);

  const nextDelivery = await upsertDelivery(null, {
    date: nextDate.date.toJSDate(),
    type: nextDate.type,
    coffee1Id: null,
    coffee2Id: null,
    coffee3Id: null,
    coffee4Id: null,
  });

  return nextDelivery;
}

export function getNextDeliveryFromList(deliveries: Delivery[]) {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 });

  return deliveries.find((d) => {
    const date = DateTime.fromISO(d.date.toString());
    return date >= today && date < nextweek;
  });
}
