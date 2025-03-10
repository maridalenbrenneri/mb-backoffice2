import { getNextFirstTuesday, getNextThirdTuesday } from './dates';
import { describe, expect, test } from '@jest/globals';
import { DateTime } from 'luxon';

describe('getNextFirstTuesday', () => {
  test('date is First Tuesday, should return same', () => {
    const date1 = DateTime.fromISO('2023-10-03');
    const date2 = DateTime.fromFormat('05.09.2023', 'dd.MM.yyyy');

    const nextTuesday1 = getNextFirstTuesday(date1);
    const nextTuesday2 = getNextFirstTuesday(date2);

    expect(nextTuesday1).toStrictEqual(DateTime.fromISO('2023-10-03'));
    expect(nextTuesday2).toStrictEqual(DateTime.fromISO('2023-09-05'));
  });

  test('date is day before First Tuesday', () => {
    const date = DateTime.fromISO('2023-09-04');

    expect(getNextFirstTuesday(date)).toStrictEqual(
      DateTime.fromISO('2023-09-05')
    );
  });

  test('date is day after First Tuesday, return next month', () => {
    const date = DateTime.fromISO('2023-09-06');

    expect(getNextFirstTuesday(date)).toStrictEqual(
      DateTime.fromISO('2023-10-03')
    );
  });
});

describe('getNextThirdTuesday', () => {
  test('date is Third Tuesday, should return same', () => {
    const date = DateTime.fromISO('2023-09-19');

    expect(getNextThirdTuesday(date)).toStrictEqual(
      DateTime.fromISO('2023-09-19')
    );
  });

  test('date is day before Third Tuesday', () => {
    const date = DateTime.fromISO('2023-09-18');

    expect(getNextThirdTuesday(date)).toStrictEqual(
      DateTime.fromISO('2023-09-19')
    );
  });

  test('date is day after Third Tuesday, return next month', () => {
    const date = DateTime.fromISO('2023-09-20');

    expect(getNextThirdTuesday(date)).toStrictEqual(
      DateTime.fromISO('2023-10-17')
    );
  });
});
