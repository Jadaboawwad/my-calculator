import { describe, it, expect } from 'vitest';
import { jummalKabir, jummalSaghir } from '../jummal';

describe('jummalKabir', () => {
  it('محمد = 92', () => {
    expect(jummalKabir('محمد').total).toBe(92);
  });

  it('علي = 110', () => {
    expect(jummalKabir('علي').total).toBe(110);
  });

  it('الله = 66', () => {
    expect(jummalKabir('الله').total).toBe(66);
  });

  it('بسم الله الرحمن الرحيم = 786', () => {
    expect(jummalKabir('بسم الله الرحمن الرحيم').total).toBe(786);
  });

  it('produces a per-letter trace with original/normalized/value', () => {
    const { trace } = jummalKabir('اب');
    expect(trace).toEqual([
      expect.objectContaining({ original: 'ا', normalized: 'ا', value: 1 }),
      expect.objectContaining({ original: 'ب', normalized: 'ب', value: 2 }),
    ]);
  });

  it('ignores spaces and diacritics', () => {
    expect(jummalKabir('مُحَمَّد').total).toBe(92);
  });
});

describe('jummalKabir with maghribi value scheme', () => {
  it('uses the maghribi values for the letters that differ (س=300، ش=1000، ص=60)', () => {
    expect(jummalKabir('س', { valueScheme: 'maghribi' }).total).toBe(300);
    expect(jummalKabir('ش', { valueScheme: 'maghribi' }).total).toBe(1000);
    expect(jummalKabir('ص', { valueScheme: 'maghribi' }).total).toBe(60);
  });
});

describe('jummalSaghir', () => {
  it('reduces each letter mod 9 (0 -> 9) before summing', () => {
    // غ kabir=1000 -> saghir=1 ; since 1000 mod 9 = 1
    expect(jummalSaghir('غ').total).toBe(1);
    // ط kabir=9 -> saghir=9
    expect(jummalSaghir('ط').total).toBe(9);
  });
});
