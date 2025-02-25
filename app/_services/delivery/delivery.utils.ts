import { DeliveryEntity } from './delivery.entity';
import { DateTime } from 'luxon';

export function getNextDeliveryFromList(deliveries: DeliveryEntity[]) {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 });

  return deliveries.find((d) => {
    const date = DateTime.fromISO(d.date.toString());
    return date >= today && date < nextweek;
  });
}
