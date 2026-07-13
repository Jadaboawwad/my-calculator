import { describe, it, expect } from 'vitest';
import { dateSeedNumber, nearestAvailableNumber, verseOfTheDay } from '../verseOfDay';

describe('dateSeedNumber', () => {
  it('is always a valid isqat-9 result (1..9)', () => {
    for (let d = 1; d <= 28; d++) {
      const n = dateSeedNumber(new Date(2026, 6, d));
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(9);
    }
  });
});

describe('nearestAvailableNumber', () => {
  it('picks the closest key from the given list', () => {
    expect(nearestAvailableNumber(5, [1, 4, 10])).toBe(4);
  });
});

describe('verseOfTheDay', () => {
  it('always returns a verse for any date, deterministically', () => {
    const date = new Date(2026, 6, 13);
    const a = verseOfTheDay(date);
    const b = verseOfTheDay(date);
    expect(a.verse).not.toBeNull();
    expect(a).toEqual(b);
  });
});
