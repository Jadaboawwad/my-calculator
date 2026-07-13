import { describe, it, expect } from 'vitest';
import { decodeChronogram, composeChronogram, hijriToGregorian, gregorianToHijri } from '../chronogram';

describe('decodeChronogram', () => {
  it('computes per-word jummal and total for a verse', () => {
    const { words, wordSums, total } = decodeChronogram('بسم الله الرحمن الرحيم');
    expect(words).toHaveLength(4);
    expect(wordSums.reduce((a, b) => a + b, 0)).toBe(total);
    expect(total).toBe(786);
  });

  it('finds word subsets summing to a target year', () => {
    const { matchingSubsets } = decodeChronogram('بسم الله الرحمن الرحيم', 786);
    expect(matchingSubsets.some((s) => s.indices.length === 4)).toBe(true);
  });
});

describe('composeChronogram', () => {
  it('suggests the 1394 letter decomposition from the book example', () => {
    const { letterSuggestion } = composeChronogram(1394);
    expect(letterSuggestion.text).toBe('غشصد');
  });
});

describe('hijri <-> gregorian (tabular, approximate)', () => {
  it('round-trips gregorian -> hijri -> gregorian', () => {
    const g = { year: 2026, month: 7, day: 13 };
    const h = gregorianToHijri(g.year, g.month, g.day);
    const back = hijriToGregorian(h.year, h.month, h.day);
    expect(back.year).toBe(g.year);
    expect(back.month).toBe(g.month);
    expect(back.day).toBe(g.day);
  });

  it('flags results as approximate', () => {
    expect(hijriToGregorian(1394, 1, 1).approximate).toBe(true);
  });
});
