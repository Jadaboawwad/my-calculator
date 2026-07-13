import { describe, it, expect } from 'vitest';
import { normalizeText } from '../normalize';

describe('normalizeText', () => {
  it('maps hamza forms to alif by default', () => {
    expect(normalizeText('أإآء').normalized).toBe('اااا');
  });

  it('respects hamzaWawAsWaw / hamzaYaAsYa sub-toggles', () => {
    expect(normalizeText('ؤئ', { hamzaWawAsWaw: true, hamzaYaAsYa: true }).normalized).toBe('وي');
    expect(normalizeText('ؤئ').normalized).toBe('اا');
  });

  it('maps ta marbuta to ha by default, ta when configured', () => {
    expect(normalizeText('مدرسة').normalized).toBe('مدرسه');
    expect(normalizeText('مدرسة', { taMarbutaAs: 'ta' }).normalized).toBe('مدرست');
  });

  it('maps alif maqsura to ya by default, alif when configured', () => {
    expect(normalizeText('هدى').normalized).toBe('هدي');
    expect(normalizeText('هدى', { alifMaqsuraAs: 'alif' }).normalized).toBe('هدا');
  });

  it('strips diacritics and tatweel', () => {
    expect(normalizeText('بِسْــمِ').normalized).toBe('بسم');
  });

  it('does not double-count shadda by default', () => {
    expect(normalizeText('الله').letters).toHaveLength(4);
  });

  it('doubles the letter under shadda when countShadda is true', () => {
    const { letters } = normalizeText('اللّه', { countShadda: true });
    expect(letters.map((l) => l.normalized)).toEqual(['ا', 'ل', 'ل', 'ل', 'ه']);
  });

  it('decomposes lam-alif ligature into ل + ا', () => {
    expect(normalizeText('ﻻ').normalized).toBe('لا');
  });

  it('drops non-Arabic characters (spaces, digits, punctuation)', () => {
    expect(normalizeText('ab 123 اب!').normalized).toBe('اب');
  });
});
