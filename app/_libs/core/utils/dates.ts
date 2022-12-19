import { DateTime } from 'luxon';

export interface DeliveryDate {
  id: number;
  date: DateTime;
  type: string;
}

// TODO: Date hell

export function toPrettyDate(date: Date | undefined | null) {
  if (!date) return null;

  if (date.toLocaleDateString) {
    return date.toLocaleDateString();
  }

  return date.toString();
  // return DateTime.fromISO(date.toString()).toFormat('dd.MM.yy');
}

export function toPrettyDateTime(
  date: Date | undefined | null,
  includeSeconds = false
) {
  if (!date) return null;

  const seconds = includeSeconds ? ':ss' : '';

  if (date.toLocaleString) {
    return date.toLocaleString();
  }

  return date.toString();

  // return DateTime.fromISO(date.toString()).toFormat(`dd.MM.yy HH:mm${seconds}`);
}

function getFirstTuesdayOfMonth(date: DateTime) {
  const firstOfMonth = date.startOf('month');
  return firstOfMonth
    .plus({ days: 7 }) // ONE WEEK INTO CURRENT MONTH
    .startOf('week') // FIRST MONDAY OF THE MONTH
    .plus({ days: 1 }); // FIRST TUESDAY OF THE MONTH - DELIVERY DAY!
}

function getFirstTuesdayOfNextMonth(date: DateTime) {
  const nextMonth = date.startOf('month').plus({ months: 1 });
  return getFirstTuesdayOfMonth(nextMonth);
}

export function resolveDateForNextDelivery(date?: DateTime) {
  date = date?.startOf('day') || DateTime.now().startOf('day');

  const tuesdayThisWeek = date.startOf('week').plus({ days: 1 });

  if (date <= tuesdayThisWeek) return tuesdayThisWeek;

  // RETURN TUESDAY NEXT WEEK
  return date.startOf('week').plus({ week: 1, days: 1 });
}

export function resolveDateForNextMonthlyDelivery(date?: DateTime) {
  date = date?.startOf('day') || DateTime.now().startOf('day');

  const firstTuesdayOfMonth = getFirstTuesdayOfMonth(date);

  if (date <= firstTuesdayOfMonth) {
    // INPUT DATE IS ON OR BEFORE THE MONTHLY DELIVERY DAY OF THIS MONTH
    return firstTuesdayOfMonth;
  }

  return getFirstTuesdayOfNextMonth(date);
}

export function resolveDateForNextMonthly3rdDelivery(date?: DateTime) {
  date = date?.startOf('day') || DateTime.now().startOf('day');

  const firstTuesdayOfMonth = getFirstTuesdayOfMonth(date);

  const thirdTuesdayOfMonth = firstTuesdayOfMonth.plus({ weeks: 2 });

  if (date <= thirdTuesdayOfMonth) {
    // INPUT DATE IS ON OR BEFORE THE MONTHLY_3RD DELIVERY DAY OF THE MONTH
    return thirdTuesdayOfMonth;
  }

  const firstTuesdayOfNextMonth = getFirstTuesdayOfNextMonth(date);

  console.log('firstTuesdayOfNextMonth', firstTuesdayOfNextMonth.toString());

  return firstTuesdayOfNextMonth.plus({ weeks: 2 });
}

function getDate(daysFromNow: number, id: number = 0): DeliveryDate {
  const fromDate = DateTime.now().plus({ days: daysFromNow }).startOf('day');

  const nextDeliveryDateAnyType = resolveDateForNextDelivery(fromDate);
  const nextMonthly = resolveDateForNextMonthlyDelivery(fromDate);
  const nextMonthly3rd = resolveDateForNextMonthly3rdDelivery(fromDate);

  console.debug(' === DATES === ');
  console.debug('getDate, input date', fromDate.toString());
  console.debug('getDate, next any', nextDeliveryDateAnyType.toString());
  console.debug('getDate, next monthly', nextMonthly.toString());
  console.debug('getDate, next 3rd', nextMonthly3rd.toString());
  console.debug(' === === ');

  let type;
  let date;
  if (nextMonthly.toISODate() === nextDeliveryDateAnyType.toISODate()) {
    type = 'MONTHLY';
    date = nextMonthly;
  } else if (
    nextMonthly3rd.toISODate() === nextDeliveryDateAnyType.toISODate()
  ) {
    type = 'MONTHLY_3RD';
    date = nextMonthly3rd;
  } else {
    type = 'NORMAL';
    date = nextDeliveryDateAnyType;
  }

  return {
    id,
    date,
    type,
  };
}

// RETURNS NEXT 5 DELIVERY DATES (Tuesdays)
export function getNextDeliveryDates(): DeliveryDate[] {
  return [
    getDate(0, 1),
    getDate(7, 2),
    getDate(14, 3),
    getDate(21, 4),
    getDate(28, 5),
  ];
}

// RETURNS NEXT DELIVERY DATE AFTER THE DATE SPECIFIED
export function getNextDeliveryDateFrom(date: DateTime): DeliveryDate {
  const today = DateTime.now().startOf('day');

  const diff = date.diff(today, ['days']);

  console.debug('getNextDeliveryDateFrom', date.toString(), diff.days);

  return getDate(diff.days);
}
