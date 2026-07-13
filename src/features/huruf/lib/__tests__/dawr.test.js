import { describe, it, expect } from 'vitest';
import { dawrOf, nextAlignment } from '../dawr';

describe('dawrOf', () => {
  it('flags the ياء pivot at rank 10', () => {
    expect(dawrOf(10).isRankPivot).toBe(true);
    expect(dawrOf(9).isRankPivot).toBe(false);
  });

  it('resolves burj and planet by isqat 12 / 7', () => {
    const d = dawrOf(7);
    expect(d.burjIndex).toBe(7);
    expect(d.burj.name).toBe('الميزان');
    expect(d.planetIndex).toBe(7);
    expect(d.planet).toBe('moon');
  });
});

describe('nextAlignment', () => {
  it('finds the next number landing on the target burj (Libra = 7)', () => {
    const next = nextAlignment(1, 7);
    expect(next).toBeGreaterThan(1);
    expect(nextAlignment(next - 1, 7)).toBe(next);
  });
});
