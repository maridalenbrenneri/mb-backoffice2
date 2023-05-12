import { DateTime } from 'luxon';

export interface DeliveryDate {
  id: number;
  date: DateTime;
  type: string;
}

export function toPrettyDate(date: Date | undefined | null) {
  if (!date) return null;

  return DateTime.fromISO(date.toString()).toFormat('dd.MM.yy');
}

export function toPrettyDateText(date: Date | undefined | null) {
  if (!date) return null;

  return DateTime.fromISO(date.toString()).toFormat('ccc d. LLL');
}

export function toPrettyDateTextLong(date: Date | undefined | null) {
  if (!date) return null;

  return DateTime.fromISO(date.toString()).toFormat('ccc d. LLL yyyy');
}

export function toPrettyDateTime(
  date: Date | undefined | null,
  includeSeconds = false
) {
  if (!date) return null;

  const seconds = includeSeconds ? ':ss' : '';

  return DateTime.fromISO(date.toString()).toFormat(`dd.MM.yy HH:mm${seconds}`);
}

export function isSameDate(date: Date, dateTime: DateTime) {
  const date1 = DateTime.fromISO(date.toString()).startOf('day');
  const date2 = dateTime.startOf('day');

  return date1.toISO() === date2.toISO();
}

// GENERATES DELIVERY DATE DATA
function getDate(daysFromNow: number, id: number = 0): DeliveryDate {
  const fromDate = DateTime.now().plus({ days: daysFromNow }).startOf('day');

  const nextDeliveryDateAnyType = getNextTuesday(fromDate);
  const nextMonthly = getNextFirstTuesday(fromDate);
  const nextMonthly3rd = getNextThirdTuesday(fromDate);

  // console.debug(' === DATES === ');
  // console.debug('getDate, input date', fromDate.toString());
  // console.debug('getDate, next any', nextDeliveryDateAnyType.toString());
  // console.debug('getDate, next monthly', nextMonthly.toString());
  // console.debug('getDate, next 3rd', nextMonthly3rd.toString());
  // console.debug(' === === ');

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

// RETURNS NEXT DELIVERY DATES (Tuesdays)
export function getNextDeliveryDates(days: number = 5): DeliveryDate[] {
  if (days < 1 || days > 50) return [];

  const result: DeliveryDate[] = [];

  let daysFromNow: number = 0;

  for (let i = 1; i <= days; i++) {
    result.push(getDate(daysFromNow, i));
    daysFromNow += 7;
  }

  return result;
}

// RETURNS NEXT DELIVERY DATE AFTER THE DATE SPECIFIED
export function getNextDeliveryDateFrom(date: DateTime): DeliveryDate {
  const today = DateTime.now().startOf('day');

  const diff = date.diff(today, ['days']);

  console.debug('getNextDeliveryDateFrom', date.toString(), diff.days);

  return getDate(diff.days);
}

//
// NEW FUNCTIONS
//

export function getNextTuesday(date: DateTime): DateTime {
  const nextTuesday = date.plus({ days: 1 }); // start with the day after the input date
  const dayOfWeek = nextTuesday.weekday; // weekday property of a DateTime object returns a 1-based index
  const daysUntilTuesday = (2 + 7 - dayOfWeek) % 7; // 2 corresponds to Tuesday
  return nextTuesday.plus({ days: daysUntilTuesday });
}

export function getNextFirstTuesday(date: DateTime): DateTime {
  const firstOfMonth = date.startOf('month');
  const dayOfWeek = firstOfMonth.weekday; // weekday property of a DateTime object returns a 1-based index
  const daysUntilTuesday = (2 + 7 - dayOfWeek) % 7; // 2 corresponds to Tuesday
  const firstTuesdayOfMonth = firstOfMonth.plus({ days: daysUntilTuesday });
  if (firstTuesdayOfMonth <= date) {
    // if the first Tuesday of this month has already passed, get the first Tuesday of next month
    return getNextFirstTuesday(firstOfMonth.plus({ months: 1 }));
  } else {
    return firstTuesdayOfMonth;
  }
}

export function getNextThirdTuesday(date: DateTime): DateTime {
  const firstOfMonth = date.startOf('month');
  const dayOfWeek = firstOfMonth.weekday; // weekday property of a DateTime object returns a 1-based index
  const daysUntilTuesday = (2 + 7 - dayOfWeek) % 7; // 2 corresponds to Tuesday
  const thirdTuesdayOfMonth = firstOfMonth.plus({
    days: daysUntilTuesday + 14,
  });
  if (thirdTuesdayOfMonth <= date) {
    // if the third Tuesday of this month has already passed, get the third Tuesday of next month
    return getNextThirdTuesday(firstOfMonth.plus({ months: 1 }));
  } else {
    return thirdTuesdayOfMonth;
  }
}

export function testTestFunc(number: number) {
  return number * 2;
}
