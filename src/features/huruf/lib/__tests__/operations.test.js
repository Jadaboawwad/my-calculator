import { describe, it, expect } from 'vitest';
import { qalb, mazj, taksir, bast } from '../operations';

describe('qalb', () => {
  it('reverses letter order', () => {
    expect(qalb('ابجد').text).toBe('دجبا');
  });
});

describe('mazj', () => {
  it('مزج(ابج, دهو) = ادبهجو', () => {
    expect(mazj('ابج', 'دهو').text).toBe('ادبهجو');
  });

  it('appends the remainder when lengths differ', () => {
    expect(mazj('اب', 'دهو').text).toBe('ادبهو');
  });
});

describe('taksir', () => {
  it('a 4-letter word cycles back to the seed', () => {
    const { rows } = taksir('ابجد');
    expect(rows[0]).toBe('ابجد');
    expect(rows[rows.length - 1]).toBe('ابجد');
    expect(rows.length).toBeGreaterThan(1);
  });

  it('single-letter words are their own trivial circle', () => {
    expect(taksir('ا').rows).toEqual(['ا']);
  });
});

describe('bast', () => {
  it('expands each letter to its spelled name before summing', () => {
    const { expandedText, total } = bast('ب');
    expect(expandedText).toBe('باء');
    expect(total).toBeGreaterThan(2); // أكبر من قيمة الباء المجردة (٢) لأنها امتدت
  });
});
