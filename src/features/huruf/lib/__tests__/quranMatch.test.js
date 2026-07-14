import { describe, it, expect } from 'vitest';
import { buildQuranIndex, matchQuranVerses } from '../quranMatch';
import { reduce } from '../engine';
import { QURAN_API_SOURCE_LABEL } from '../quranApi';

/** آية وهمية للفهرس */
const ayah = (surahNumber, ayahNumber, text, surahName = 'اختبار') => ({
  surahNumber,
  surahName,
  ayahNumber,
  text,
});

// المدخل المرجعي في كل الاختبارات: «الله» = ٦٦ (كبير) ← ٦ (مرجعي) — استنطاق ٦٦ = «سو»
const result = () => reduce({ scale: 'word', raw: 'الله' });

describe('quranMatch — مطابقة أي آية من كامل المصحف', () => {
  it('يفهرس الآيات بجُمَّلها وعددها المرجعي وكلماتها المطبّعة', () => {
    const index = buildQuranIndex([ayah(1, 1, 'الله نور')]);
    expect(index.verses).toHaveLength(1);
    // الله=٦٦ + نور=٢٥٦ ← ٣٢٢ ← مرجعي ٢
    expect(index.verses[0].total).toBe(322);
    expect(index.verses[0].canonical).toBe(2);
    expect(index.byWord.has('الله')).toBe(true);
    expect(index.byWord.has('نور')).toBe(true);
  });

  it('الدرجة ١: تطابق الجُمَّل الكبير التام له الأولوية ولا يتكرر في درجة أدنى', () => {
    const index = buildQuranIndex([ayah(1, 1, 'الله')]); // ٦٦ = نفس جُمَّل المدخل
    const m = matchQuranVerses(result(), index);
    expect(m).toHaveLength(1);
    expect(m[0].matchType).toBe('quran_total');
    expect(m[0].matchedValue).toBe(66);
    expect(m[0].documented).toBe(true);
    expect(m[0].entry.source).toBe(QURAN_API_SOURCE_LABEL);
    expect(m[0].trace).toContain('يطابق الجُمَّل الكبير');
  });

  it('الدرجة ٢: الآية التي تحوي لفظ استنطاق العدد ككلمة قائمة', () => {
    // استنطاق ٦٦ = «سو» — آية وهمية تحوي هذا اللفظ ككلمة مستقلة
    const index = buildQuranIndex([ayah(2, 5, 'قال سو ذلك')]);
    const m = matchQuranVerses(result(), index);
    const ist = m.find((x) => x.matchType === 'quran_istintaq');
    expect(ist).toBeDefined();
    expect(ist.trace).toContain('«سو»');
    expect(ist.ruleIds).toContain('R13');
  });

  it('الدرجة ٣: نفس العدد المرجعي — مرتّبة بالأقرب في الجُمَّل الكبير', () => {
    // «دب»=٦ و«كو»=٢٦: كلاهما مرجعيه ٦ — الأقرب إلى ٦٦ هو ٢٦
    const index = buildQuranIndex([ayah(3, 1, 'دب'), ayah(3, 2, 'كو')]);
    const m = matchQuranVerses(result(), index);
    expect(m.map((x) => x.matchType)).toEqual(['quran_canonical', 'quran_canonical']);
    expect(m[0].entry.ayahNumber).toBe(2); // «كو» أولًا
    expect(m[0].trace).toContain('نفس العدد المرجعي');
  });

  it('لا تكرار لنفس الآية عبر الدرجات ويُحترم الحد الأقصى', () => {
    const corpus = [
      ayah(1, 1, 'الله'), // درجة ١ ومرجعيها ٦ أيضًا
      ...Array.from({ length: 20 }, (_, i) => ayah(4, i + 1, i % 2 ? 'دب' : 'كو')),
    ];
    const index = buildQuranIndex(corpus);
    const m = matchQuranVerses(result(), index, { limit: 5 });
    expect(m).toHaveLength(5);
    const keys = m.map((x) => `${x.entry.surah}:${x.entry.ayahNumber}:${x.entry.id}`);
    expect(new Set(keys).size).toBe(5);
    expect(m.filter((x) => x.entry.id === 'quran-1-1')).toHaveLength(1);
  });

  it('يعمل على المقاييس الثلاثة للمحرك بلا استثناء', () => {
    const index = buildQuranIndex([ayah(1, 1, 'الله'), ayah(1, 2, 'دب'), ayah(1, 3, 'كو')]);
    for (const input of [
      { scale: 'word', raw: 'محمد' },
      { scale: 'text', raw: 'قل هو الله أحد' },
      { scale: 'time', raw: 1447 },
    ]) {
      const m = matchQuranVerses(reduce(input), index);
      for (const x of m) {
        expect(x.trace.trim()).not.toBe('');
        expect(x.ruleIds).toContain('R32');
      }
    }
  });

  it('خيارات التطبيع تُغيّر جُمَّل الآيات في الفهرس (نفس قواعد النظام)', () => {
    const corpus = [ayah(1, 1, 'رحمة')];
    const asHa = buildQuranIndex(corpus); // ة ← ه (افتراضي)
    const asTa = buildQuranIndex(corpus, { taMarbutaAs: 'ta' }); // ة ← ت
    expect(asHa.verses[0].total).not.toBe(asTa.verses[0].total);
  });
});
