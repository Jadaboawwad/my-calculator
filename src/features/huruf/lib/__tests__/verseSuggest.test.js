import { describe, it, expect } from 'vitest';
import { suggestVerses } from '../verseSuggest';
import { reduce } from '../engine';
import { SEED_ENTRIES } from '../../data/quranNumeric';

const testEntry = (numericValue, over = {}) => ({
  id: `t-${numericValue}-${over.surah || 'اختبار'}`,
  surah: over.surah || 'اختبار',
  ayahNumber: over.ayahNumber || 1,
  textExcerpt: over.textExcerpt || `آية اختبارية للعدد ${numericValue}`,
  category: 'user_curated',
  numericValue,
  source: over.source ?? 'مصدر اختباري',
  ...over,
});

describe('verseSuggest — اقتراح الآيات ذات الصلة العددية', () => {
  it('تطابق الجُمَّل الكبير مباشرة (kabir_direct) له الأولوية', () => {
    // «ا» = ١: المجموع والمرجعي كلاهما ١ — الآية تُقترح مرة واحدة بأقوى مطابقة
    const r = reduce({ scale: 'word', raw: 'ا' });
    const s = suggestVerses(r, { entries: [testEntry(1)], includeMuqattaatEcho: false });
    expect(s).toHaveLength(1);
    expect(s[0].matchType).toBe('kabir_direct');
    expect(s[0].trace).toContain('الجُمَّل الكبير');
  });

  it('تطابق العدد المرجعي (canonical) عند غياب التطابق المباشر', () => {
    // «الله» = ٦٦ ← مرجعي ٦
    const r = reduce({ scale: 'word', raw: 'الله' });
    const s = suggestVerses(r, { entries: [testEntry(6)], includeMuqattaatEcho: false });
    expect(s).toHaveLength(1);
    expect(s[0].matchType).toBe('canonical');
    expect(s[0].matchedValue).toBe(6);
  });

  it('تطابق إسقاط آخر مع تسمية المقياس في الأثر', () => {
    // «الله» = ٦٦: إسقاط ٩ ← ٣، إسقاط ١٢ ← ٦ (لكن ٦ يمسكها canonical أولًا لو وُجدت)
    const r = reduce({ scale: 'word', raw: 'الله' });
    const s = suggestVerses(r, { entries: [testEntry(3)], includeMuqattaatEcho: false });
    expect(s).toHaveLength(1);
    expect(s[0].matchType).toBe('projection');
    expect(s[0].trace).toContain('إسقاط ٩');
  });

  it('عند غياب أي تطابق: أقرب عدد متوفر مع تصريح بذلك', () => {
    const r = reduce({ scale: 'word', raw: 'الله' }); // مرجعي ٦
    const s = suggestVerses(r, { entries: [testEntry(1000)], includeMuqattaatEcho: false });
    expect(s).toHaveLength(1);
    expect(s[0].matchType).toBe('nearest');
    expect(s[0].trace).toContain('لا تطابق مباشر');
  });

  it('صدى الفواتح المقطّعة: هوية حسابية فقط وبعبارة «بلا تفسير»', () => {
    // «ا» مرجعيها ١ — وفواتح الم/المص/الر/المر تختزل إلى ١
    const r = reduce({ scale: 'word', raw: 'ا' });
    const s = suggestVerses(r, { entries: [], limit: 30 });
    expect(s.length).toBeGreaterThan(0);
    for (const sug of s) {
      expect(sug.matchType).toBe('muqattaat_echo');
      expect(sug.trace).toContain('بلا تفسير');
    }
  });

  it('لا تكرار لنفس الآية ولو تطابقت في أكثر من مستوى', () => {
    const r = reduce({ scale: 'word', raw: 'ا' }); // ١ في كل الإسقاطات
    const s = suggestVerses(r, { entries: [testEntry(1)], includeMuqattaatEcho: false });
    expect(s).toHaveLength(1);
  });

  it('يحترم الحد الأقصى (limit) ويعلّم غير الموثّق', () => {
    const r = reduce({ scale: 'word', raw: 'الله' });
    const entries = [testEntry(6, { surah: 'أ' }), testEntry(6, { surah: 'ب', source: '' })];
    const s = suggestVerses(r, { entries, limit: 1, includeMuqattaatEcho: false });
    expect(s).toHaveLength(1);

    const all = suggestVerses(r, { entries, includeMuqattaatEcho: false });
    const undocumented = all.find((x) => x.entry.surah === 'ب');
    expect(undocumented.documented).toBe(false);
  });

  it('يعمل مع بذرة المشروع الفعلية على المقاييس الثلاثة', () => {
    for (const input of [
      { scale: 'word', raw: 'محمد' },
      { scale: 'text', raw: 'قل هو الله أحد' },
      { scale: 'time', raw: 1447 },
    ]) {
      const s = suggestVerses(reduce(input), { entries: SEED_ENTRIES });
      expect(s.length).toBeGreaterThan(0);
      for (const sug of s) {
        expect(sug.trace.trim()).not.toBe('');
        expect(sug.ruleIds).toContain('R32');
      }
    }
  });
});
