import { describe, it, expect } from 'vitest';
import { isqat } from '../isqat';

describe('isqat', () => {
  it('never returns 0 — a zero remainder wraps to the modulus (خذه صحيحًا مكمَّلا)', () => {
    expect(isqat(9, 9)).toBe(9);
    expect(isqat(18, 9)).toBe(9);
    expect(isqat(12, 12)).toBe(12);
  });

  it('isqat(10, 9) = 1', () => {
    expect(isqat(10, 9)).toBe(1);
  });

  it('cycles correctly across a range', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => isqat(n, 9))).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2,
    ]);
  });
});
