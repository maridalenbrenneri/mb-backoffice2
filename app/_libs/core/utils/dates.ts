import { DateTime } from 'luxon';

export interface DeliveryDate {
  id: number;
  date: DateTime;
  type: string;
}

export function toPrettyDate(date: DateTime | Date | undefined | null) {
  if (!date) return null;

  return DateTime.fromISO(date.toString()).toFormat('dd.MM.yy');
}

export function toPrettyDateTime(
  date: DateTime | Date | undefined | null,
  includeSeconds = false
) {
  if (!date) return null;

  const seconds = includeSeconds ? ':ss' : '';

  return DateTime.fromISO(date.toString()).toFormat(`dd.MM.yy HH:mm${seconds}`);
}

export function resolveDateForNextMonthlyDelivery(date?: DateTime) {
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

  const nextStorAbo = resolveDateForNextMonthlyDelivery(date);

  // TODO: HANDLE MONTHLY_3RD "BEDRIFTS-ABO"

  const type =
    nextStorAbo.toISODate() === date.toISODate() ? 'STORABO' : 'NORMAL';

  return {
    id,
    date,
    type,
  };
}

// RETURNS NEXT 5 DELIVERY DATES (Tuesdays)
export function getNextDeliveryDates(): DeliveryDate[] {
  return [
    getDate(7, 1),
    getDate(14, 2),
    getDate(21, 3),
    getDate(28, 4),
    getDate(35, 5),
  ];
}

// RETURNS NEXT DELIVERY DATE AFTER THE DATE SPECIFIED
export function getNextDeliveryDateFrom(date: DateTime): DeliveryDate {
  const today = DateTime.now().startOf('day');

  const diff = date.diff(today, ['days']);

  console.debug('getNextDeliveryDateFrom', date.toString(), diff.days);

  return getDate(diff.days);
}
