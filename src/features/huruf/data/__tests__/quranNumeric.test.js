import { describe, it, expect } from 'vitest';
import {
  MUQATTAAT_ENTRIES,
  EXPLICIT_NUMBER_ENTRIES,
  SEED_ENTRIES,
  isDocumented,
  QURAN_NUMERIC_CATEGORIES,
} from '../quranNumeric';
import { MUQATTAAT_SURAH_COUNT } from '../muqattaat';

describe('quranNumeric — سلامة البذرة', () => {
  it('فواتح ٢٩ سورة مقطّعة، كل واحدة لسورة مختلفة', () => {
    expect(MUQATTAAT_ENTRIES).toHaveLength(MUQATTAAT_SURAH_COUNT);
    expect(new Set(MUQATTAAT_ENTRIES.map((e) => e.id)).size).toBe(29);
  });

  it('١٣٦ آية عدد صريح من قاعدة المشروع، كلها بقيمة عددية', () => {
    expect(EXPLICIT_NUMBER_ENTRIES).toHaveLength(136);
    for (const e of EXPLICIT_NUMBER_ENTRIES) {
      expect(typeof e.numericValue).toBe('number');
    }
  });

  it('كل مدخلات البذرة موثّقة المصدر وصنفها صالح', () => {
    const validCategories = Object.keys(QURAN_NUMERIC_CATEGORIES);
    for (const e of SEED_ENTRIES) {
      expect(isDocumented(e)).toBe(true);
      expect(validCategories).toContain(e.category);
      expect(e.textExcerpt.trim()).not.toBe('');
      expect(e.ayahNumber).toBeGreaterThanOrEqual(1);
    }
  });

  it('فواتح المقطّعات بلا قيمة عددية مدّعاة — تُحسب حيًّا فقط', () => {
    for (const e of MUQATTAAT_ENTRIES) {
      expect(e.numericValue).toBeUndefined();
    }
  });

  it('isDocumented يرفض المصدر الفارغ', () => {
    expect(isDocumented({ source: '' })).toBe(false);
    expect(isDocumented({ source: '   ' })).toBe(false);
    expect(isDocumented({ source: 'تفسير القرطبي' })).toBe(true);
  });
});
