import { testTestFunc, getNextFirstTuesday } from './dates';
import { describe, expect, test } from '@jest/globals';
import { DateTime } from 'luxon';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(testTestFunc(1)).toBe(2);
  });
});

const date = DateTime.now(); //.fromISO('2023-05-11T00:00:00.000Z'); // Wednesday, May 11 2023

describe('getNextFirstTuesday', () => {
  test('getNextFirstTuesday', () => {
    const nextFirstTuesday = getNextFirstTuesday(date);
    console.log(nextFirstTuesday.toISO()); // 2023-06-06T00:00:00.000Z

    expect(getNextFirstTuesday(date)).toBe(
      DateTime.fromISO('2023-06-06T00:00:00.000+02:00')
    );
  });
});
