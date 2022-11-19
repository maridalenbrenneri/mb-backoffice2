import { DateTime } from 'luxon';

import { getDeliveries, getDelivery } from '../models/delivery.server';

export async function getNextDelivery() {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 }).startOf('day');

  const delivery = await getDelivery({
    where: {
      date: {
        gte: today.toJSDate(),
        lte: nextweek.toJSDate(),
      },
    },
  });

  if (delivery) return delivery;

  // IF NO DELIVERY WAS FOUND FOR NEXT WEEK, TRY GETTING THE NEXT ONE ANY DATE GREATER THAN TODAY

  const deliveries = await getDeliveries({
    where: {
      date: {
        gte: today.toJSDate(),
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 1,
  });

  if (!deliveries.length) throw new Error('No Deliveries found');

  return deliveries[0];
}
