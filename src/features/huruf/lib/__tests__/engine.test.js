import { describe, it, expect } from 'vitest';
import { reduce, CANONICAL_MODULUS, validateReductionInput, profile } from '../engine';
import { predictVerseNumber } from '../predictedVerse';

describe('engine.reduce — word scale', () => {
  it('reduces محمد to canonical number via mod 10', () => {
    const result = reduce({ scale: 'word', raw: 'محمد' });
    expect(result.scale).toBe('word');
    expect(result.rawTotal).toBe(92);
    expect(result.canonicalNumber).toBe(2); // 92 mod 10 → 2
    expect(result.letterTrace).toHaveLength(4);
    expect(result.lattice.rank).toBeGreaterThanOrEqual(1);
    expect(result.lattice.rank).toBeLessThanOrEqual(10);
    expect(result.sourceTrace).toContain('rule-13');
  });

  it('rejects multi-word input on word scale', () => {
    expect(() => reduce({ scale: 'word', raw: 'بسم الله' })).toThrow();
  });
});

describe('engine.reduce — text scale', () => {
  it('reduces بسم الله الرحمن الرحيم as chronogram text', () => {
    const result = reduce({ scale: 'text', raw: 'بسم الله الرحمن الرحيم' });
    expect(result.rawTotal).toBe(786);
    expect(result.chronogram?.words).toHaveLength(4);
    expect(result.sourceTrace).toContain('rule-22');
  });
});

describe('engine.reduce — time scale', () => {
  it('applies same isqat logic to a year', () => {
    const result = reduce({ scale: 'time', raw: 1394 });
    expect(result.scale).toBe('time');
    expect(result.rawTotal).toBe(1394);
    expect(result.letterTrace).toHaveLength(0);
    expect(result.canonicalNumber).toBe(isqatExpected(1394, CANONICAL_MODULUS));
    expect(result.trace.nextLibraYear).toBeGreaterThan(1394);
    expect(result.sourceTrace).toContain('rule-33');
  });
});

function isqatExpected(n, modulus) {
  return ((n - 1) % modulus + modulus) % modulus + 1;
}

describe('engine.reduce — depth', () => {
  it('applies three ranks of opening', () => {
    const d1 = reduce({ scale: 'word', raw: 'محمد' }, { depth: 1 });
    const d3 = reduce({ scale: 'word', raw: 'محمد' }, { depth: 3 });
    expect(d1.depth).toBe(1);
    expect(d3.depth).toBe(3);
    expect(d3.sourceTrace).toContain('rule-19');
    expect(d3.trace.steps.some((s) => s.label.includes('عمق'))).toBe(true);
  });
});

describe('engine.reduce — disclosure', () => {
  it('beginner reading is shorter than advanced', () => {
    const b = reduce({ scale: 'word', raw: 'علي' }, { disclosureLevel: 'beginner' });
    const a = reduce({ scale: 'word', raw: 'علي' }, { disclosureLevel: 'advanced' });
    expect(b.reading.length).toBeLessThan(a.reading.length);
    expect(b.canonicalNumber).toBe(a.canonicalNumber);
  });
});

describe('validateReductionInput', () => {
  it('guards empty input', () => {
    expect(() => validateReductionInput('text', '')).toThrow();
  });
});

describe('profile', () => {
  it('returns number + nature + mizan together', () => {
    const p = profile('محمد');
    expect(p.kabir).toBe(92);
    expect(p.mizan.isqat9).toBeTruthy();
    expect(p.mizan.nature).toBeTruthy();
    expect(p.reduction).toBeTruthy();
  });
});

describe('predictVerseNumber', () => {
  it('returns a verse number and optional local text', () => {
    const date = new Date(2026, 6, 13, 12, 30, 0);
    const predicted = predictVerseNumber(date);
    expect(predicted.verseNumber).toBeGreaterThanOrEqual(1);
    expect(predicted.verseNumber).toBeLessThanOrEqual(6236);
    expect(predicted.sourceTrace).toContain('rule-33');
  });

  it('is deterministic for the same date', () => {
    const date = new Date(2026, 6, 13, 8, 15, 30);
    const a = predictVerseNumber(date);
    const b = predictVerseNumber(date);
    expect(a.verseNumber).toBe(b.verseNumber);
  });
});
