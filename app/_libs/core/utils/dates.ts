import { DateTime } from 'luxon';

export interface DeliveryDate {
  id: number;
  date: DateTime;
  type: string;
}

export function toPrettyDate(date: DateTime | Date) {
  return DateTime.fromISO(date.toString()).toFormat('dd.MM.yyyy');
}

export function toPrettyDateTime(date: DateTime | Date) {
  return DateTime.fromISO(date.toString()).toFormat('dd.MM.yyyy HH:mm:ss');
}

// export function toPrettyDateJS(date: Date) {
//   return toPrettyDate(DateTime.fromISO(date.toString()));
// }

// RESOLVE NEXT STOR-ABO
export function resolveNextDeliveryDay(date?: DateTime) {
  date = date?.startOf('day') || DateTime.now().startOf('day');

  const firstOfMonth = date.startOf('month');
  const firstTuesdayOfMonth = firstOfMonth
    .plus({ days: 7 }) // ONE WEEK INTO CURRENT MONTH
    .startOf('week') // FIRST MONDAY OF THE MONTH
    .plus({ days: 1 }); // FIRST TUESDAY OF THE MONTH - DELIVERY DAY!

  if (date <= firstTuesdayOfMonth) {
    // INPUT DATE IS ON OR BEFORE THE DELIVERY DAY OF THE MONTH
    return firstTuesdayOfMonth;
  }

  const firstTuesdayOfNextMonth = firstOfMonth
    .plus({ months: 1, days: 7 }) // ONE WEEK INTO NEXT MONTH
    .startOf('week') // FIRST MONDAY OF THE MONTH
    .plus({ days: 1 }); //  FIRST TUESDAY OF THE MONTH - DELIVERY DAY!

  return firstTuesdayOfNextMonth;
}

function getDate(daysFromNow: number, id: number = 0): DeliveryDate {
  const date = DateTime.now()
    .plus({ days: daysFromNow })
    .startOf('week')
    .plus({ days: 1 });

  const nextStorAbo = resolveNextDeliveryDay(date);

  const type =
    nextStorAbo.toISODate() === date.toISODate() ? 'STORABO' : 'NORMAL';

  return {
    id,
    date,
    type,
  };
}

// Return next five delivery dates (tuesdays)
export function getNextDeliveryDates(): DeliveryDate[] {
  return [
    getDate(7, 1),
    getDate(14, 2),
    getDate(21, 3),
    getDate(28, 4),
    getDate(35, 5),
  ];
}

export function getNextDeliveryDate(): DeliveryDate {
  return getDate(7);
}
