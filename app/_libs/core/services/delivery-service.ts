import { DateTime } from 'luxon';

import type { Delivery } from '@prisma/client';

import { getDelivery, upsertDelivery } from '../models/delivery.server';
import { getNextDeliveryDateFrom } from '../utils/dates';

// RESOLVES NEXT DELIVERY AFTER TODAY OR ON THE DATE SPECIFIED. IF DELIVERY DOESN'T EXIST, IT IS CREATED
export async function getNextOrCreateDelivery(
  date: DateTime | undefined = undefined
): Promise<Delivery> {
  const currentDate = date
    ? date.startOf('day')
    : DateTime.now().startOf('day');
  const nextweek = currentDate.plus({ days: 7 });

  console.debug(
    'getNextOrCreateDelivery, finding Delivery day between dates ',
    currentDate.toISO(),
    nextweek.toISO()
  );

  const delivery = date
    ? await getDelivery({
        // RETURN ONLY DELIVERY DAY IF EXISTS ON THE SPECIFIC DATE
        where: {
          date: {
            gte: currentDate.toJSDate(),
            lte: currentDate.toJSDate(),
          },
        },
      })
    : await getDelivery({
        // RETURN DELIVERY DAY IF ANY EXISTS IN THE COMING WEEK
        where: {
          date: {
            gt: currentDate.toJSDate(),
            lt: nextweek.toJSDate(),
          },
        },
      });

  if (delivery) {
    console.debug(
      'getNextOrCreateDelivery, Delivery day found, returning existing ',
      delivery.id,
      delivery.date,
      delivery.type
    );

    return delivery;
  }

  // DELIVERY NOT FOUND, CREATE

  console.debug(
    'getNextOrCreateDelivery, creating new Delivery day from date',
    currentDate.toISO()
  );

  const nextDate = getNextDeliveryDateFrom(currentDate);

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
