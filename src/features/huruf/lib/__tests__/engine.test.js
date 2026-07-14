import { describe, it, expect } from 'vitest';
import { reduce, CANONICAL_MODULUS, LIBRA_BURJ_INDEX, READING_DISCLAIMER } from '../engine';
import { isqat } from '../isqat';
import { nextAlignment } from '../dawr';
import { burjByIndex } from '../../data/schemes';

describe('engine.reduce — مقياس الكلمة', () => {
  it('«الله» → المجموع ٦٦، العدد المرجعي ٦، ست دورات كاملة', () => {
    const r = reduce({ scale: 'word', raw: 'الله' });
    expect(r.total).toBe(66);
    expect(r.canonicalNumber).toBe(6);
    expect(r.cyclesCompleted).toBe(6);
    expect(r.letterTrace).toHaveLength(4);
    expect(r.lattice.burj).toEqual(burjByIndex(isqat(66, 12)));
    expect(r.lattice.rank).toBe(isqat(66, 10));
  });

  it('يرفض المدخل الفارغ وغير العربي (guard R12/R23)', () => {
    expect(() => reduce({ scale: 'word', raw: '' })).toThrow();
    expect(() => reduce({ scale: 'word', raw: '123 abc' })).toThrow();
  });
});

describe('engine.reduce — مقياس النص', () => {
  it('كلمة واحدة عبر مقياس النص تعطي نفس أرقام مقياس الكلمة (ثبات المحرك)', () => {
    const word = reduce({ scale: 'word', raw: 'الله' });
    const text = reduce({ scale: 'text', raw: 'الله' });
    expect(text.total).toBe(word.total);
    expect(text.canonicalNumber).toBe(word.canonicalNumber);
    expect(text.lattice).toEqual(word.lattice);
    expect(text.projections).toEqual(word.projections);
  });

  it('يبحث عن تركيبة كلمات تساوي العدد المطلوب (التأريخ الشعري R22)', () => {
    // «باب» = ٥، «دار» = ٢٠٥ → target 205 يطابق كلمة «دار» وحدها
    const r = reduce({ scale: 'text', raw: 'باب دار', options: { targetNumber: 205, depth: 3 } });
    expect(r.detail.chronogram.matchingSubsets.length).toBeGreaterThan(0);
    expect(r.detail.chronogram.matchingSubsets[0].words).toEqual(['دار']);
    expect(r.total).toBe(210);
    expect(r.reading).toContain('تركيبة');

    const none = reduce({ scale: 'text', raw: 'باب دار', options: { targetNumber: 999, depth: 3 } });
    expect(none.reading).toContain('لا تركيبة');
  });
});

describe('engine.reduce — مقياس الزمن', () => {
  it('سنة ١٤٤٧ هـ: الشبكة من نفس الإسقاطات، وأقرب سنة ميزان صحيحة', () => {
    const r = reduce({ scale: 'time', raw: 1447 });
    expect(r.total).toBe(1447);
    expect(r.canonicalNumber).toBe(isqat(1447, CANONICAL_MODULUS));
    expect(r.lattice.rank).toBe(isqat(1447, 10));
    expect(r.lattice.burj).toEqual(burjByIndex(isqat(1447, 12)));
    expect(r.detail.nextLibraYear).toBe(nextAlignment(1447, LIBRA_BURJ_INDEX));
    expect(r.letterTrace).toEqual([]);
  });

  it('يحوّل السنة الميلادية هجريًا (تحويل جدولي تقريبي) قبل الاختزال', () => {
    const r = reduce({ scale: 'time', raw: 2026, options: { calendar: 'gregorian' } });
    expect(r.detail.approximateConversion).toBe(true);
    expect(r.detail.hijriYear).toBeGreaterThan(1440);
    expect(r.total).toBe(r.detail.hijriYear);
  });

  it('يرفض سنة غير صالحة', () => {
    expect(() => reduce({ scale: 'time', raw: 'ليس رقمًا' })).toThrow();
    expect(() => reduce({ scale: 'time', raw: 0 })).toThrow();
    expect(() => reduce({ scale: 'time', raw: 3001 })).toThrow();
  });
});

describe('engine — القاعدة الجامعة (SPEC §2)', () => {
  it('المجاميع المتساوية تعطي نفس العدد المرجعي ونفس الشبكة عبر المقاييس', () => {
    // «يد» = ١٠+٤ = ١٤ — والسنة ١٤ على مقياس الزمن
    const word = reduce({ scale: 'word', raw: 'يد' });
    const time = reduce({ scale: 'time', raw: 14 });
    expect(word.total).toBe(14);
    expect(time.total).toBe(14);
    expect(word.canonicalNumber).toBe(time.canonicalNumber);
    expect(word.lattice.rank).toBe(time.lattice.rank);
    expect(word.lattice.burj).toEqual(time.lattice.burj);
    expect(word.projections).toEqual(time.projections);
  });

  it('العمق ومستوى الإفصاح يغيّران القراءة فقط، لا الأرقام (R19/R26)', () => {
    const base = reduce({ scale: 'word', raw: 'محمد' });
    const deep = reduce({ scale: 'word', raw: 'محمد', options: { depth: 3, disclosureLevel: 'advanced' } });
    expect(deep.canonicalNumber).toBe(base.canonicalNumber);
    expect(deep.total).toBe(base.total);
    expect(deep.lattice).toEqual(base.lattice);
    expect(deep.projections).toEqual(base.projections);
    expect(deep.reading).not.toBe(base.reading);
    expect(deep.reading.length).toBeGreaterThan(base.reading.length);
  });

  it('عند بلوغ الياء (١٠) تُذكر ولادة الدورة الجديدة (R24)', () => {
    // «ي» = ١٠
    const r = reduce({ scale: 'word', raw: 'ي' });
    expect(r.canonicalNumber).toBe(10);
    expect(r.reading).toContain('تمام المراتب');
  });

  it('كل قراءة تنتهي بالتنويه الإطاري (SPEC §6)', () => {
    for (const input of [
      { scale: 'word', raw: 'نور' },
      { scale: 'text', raw: 'نور على نور' },
      { scale: 'time', raw: 1447 },
    ]) {
      expect(reduce(input).reading).toContain(READING_DISCLAIMER);
    }
  });

  it('يرفض مقياسًا غير معروف', () => {
    expect(() => reduce({ scale: 'planet', raw: 'x' })).toThrow();
  });
});
