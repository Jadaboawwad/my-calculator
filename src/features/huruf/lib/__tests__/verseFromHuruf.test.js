import { describe, it, expect } from 'vitest';
import { calculateHurufVerseNumber } from '../verseFromHuruf';

describe('calculateHurufVerseNumber', () => {
  it('returns a verse number between 1 and 6236', () => {
    const { verseNumber } = calculateHurufVerseNumber({
      hours: 14,
      minutes: 30,
      seconds: 5,
      hijriDate: { year: 1447, month: 1, day: 15 },
      gregorianDate: { year: 2026, month: 7, day: 13 },
    });
    expect(verseNumber).toBeGreaterThanOrEqual(1);
    expect(verseNumber).toBeLessThanOrEqual(6236);
  });

  it('is deterministic for the same inputs', () => {
    const params = {
      hours: 9,
      minutes: 19,
      seconds: 0,
      hijriDate: { year: 1447, month: 7, day: 13 },
      gregorianDate: { year: 2026, month: 7, day: 13 },
      selectedNumber: 7,
    };
    const a = calculateHurufVerseNumber(params);
    const b = calculateHurufVerseNumber(params);
    expect(a).toEqual(b);
  });

  it('includes istintaq metadata for hijri year', () => {
    const { hurufMeta } = calculateHurufVerseNumber({
      hours: 12,
      minutes: 0,
      seconds: 0,
      hijriDate: { year: 1394, month: 1, day: 1 },
    });
    expect(hurufMeta.hijriYearIstintaq).toBeTruthy();
    expect(hurufMeta.profiles.hijriYear).not.toBeNull();
  });

  it('keeps time istintaq short (per-component, not composite HHMMSS)', () => {
    const { hurufMeta } = calculateHurufVerseNumber({
      hours: 17,
      minutes: 30,
      seconds: 0,
    });
    expect(hurufMeta.timeIstintaq).toBeTruthy();
    expect(hurufMeta.timeIstintaq.length).toBeLessThan(20);
    expect(hurufMeta.timeIstintaq).toContain('·');
  });
});
