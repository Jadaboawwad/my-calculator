// اقتراح الآيات ذات الصلة العددية — يربط أي نتيجة من المحرك الموحد بمدخلات الوحدة القرآنية،
// مع أثر (trace) عربي صريح لكل مطابقة: «من أين جاء هذا الاقتراح؟» (R17/R32).
// المطابقة حسابية وصفية فقط — لا ادّعاء تفسيري (SPEC §4/§6).

import { reduce } from './engine';
import { nearestAvailableNumber } from './verseOfDay';
import { SEED_ENTRIES, MUQATTAAT_ENTRIES, isDocumented } from '../data/quranNumeric';

export const MATCH_TYPE_LABELS = {
  kabir_direct: 'تطابق الجُمَّل الكبير',
  canonical: 'تطابق العدد المرجعي',
  projection: 'تطابق إسقاط',
  nearest: 'أقرب عدد متوفر',
  muqattaat_echo: 'صدى فاتحة مقطّعة',
};

const PROJECTION_MODULI = { isqat9: 9, isqat12: 12, isqat28: 28, isqat7: 7, isqat4: 4 };
const ARABIC_DIGITS = { 4: '٤', 7: '٧', 9: '٩', 12: '١٢', 28: '٢٨' };

// القيم المرجعية لفواتح السور تُحسب مرة واحدة (memoized) عبر نفس المحرك — R7
let muqattaatCanonicalCache = null;
function muqattaatCanonicals() {
  if (!muqattaatCanonicalCache) {
    const byOpener = new Map();
    for (const entry of MUQATTAAT_ENTRIES) {
      if (!byOpener.has(entry.textExcerpt)) {
        const r = reduce({ scale: 'text', raw: entry.textExcerpt });
        byOpener.set(entry.textExcerpt, { canonicalNumber: r.canonicalNumber, total: r.total });
      }
    }
    muqattaatCanonicalCache = byOpener;
  }
  return muqattaatCanonicalCache;
}

/**
 * @typedef {Object} VerseSuggestion
 * @property {import('../data/quranNumeric').QuranNumericEntry} entry
 * @property {'kabir_direct'|'canonical'|'projection'|'nearest'|'muqattaat_echo'} matchType
 * @property {number} matchedValue
 * @property {string} trace       شرح عربي لسبب الاقتراح
 * @property {string[]} ruleIds   القواعد المنتجة (لربط LearnMode)
 * @property {boolean} documented
 */

/**
 * يقترح آيات ذات صلة عددية بنتيجة اختزال.
 * @param {import('./engine').ReductionResult} result
 * @param {{entries?: import('../data/quranNumeric').QuranNumericEntry[], limit?: number, includeMuqattaatEcho?: boolean}} [opts]
 * @returns {VerseSuggestion[]}
 */
export function suggestVerses(result, opts = {}) {
  const { entries = SEED_ENTRIES, limit = 8, includeMuqattaatEcho = true } = opts;
  const numbered = entries.filter((e) => e.numericValue != null);

  const suggestions = [];
  const seen = new Set();

  const push = (entry, matchType, matchedValue, trace) => {
    const key = `${entry.surah}:${entry.ayahNumber}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push({
      entry,
      matchType,
      matchedValue,
      trace,
      ruleIds: ['R17', 'R32'],
      documented: isDocumented(entry),
    });
  };

  // ١ — تطابق الجُمَّل الكبير مباشرة
  for (const e of numbered) {
    if (e.numericValue === result.total) {
      push(e, 'kabir_direct', result.total,
        `الجُمَّل الكبير للمدخل = ${result.total} — يطابق العدد الصريح في الآية`);
    }
  }

  // ٢ — تطابق العدد المرجعي (إسقاط ١٠ / الياء)
  for (const e of numbered) {
    if (e.numericValue === result.canonicalNumber) {
      push(e, 'canonical', result.canonicalNumber,
        `الاختزال القانوني (إسقاط ١٠ / الياء) للمجموع ${result.total} = ${result.canonicalNumber}`);
    }
  }

  // ٣ — تطابق أحد الإسقاطات الأخرى
  for (const [projKey, modulus] of Object.entries(PROJECTION_MODULI)) {
    const value = result.projections[projKey];
    for (const e of numbered) {
      if (e.numericValue === value) {
        push(e, 'projection', value,
          `إسقاط ${ARABIC_DIGITS[modulus]} للمجموع ${result.total} ← ${value}`);
      }
    }
  }

  // ٤ — لا تطابق مباشر: أقرب عدد متوفر في القاعدة (يُصرَّح بذلك في الأثر)
  if (suggestions.length === 0 && numbered.length > 0) {
    const keys = [...new Set(numbered.map((e) => e.numericValue))].sort((a, b) => a - b);
    const nearest = nearestAvailableNumber(result.canonicalNumber, keys);
    for (const e of numbered) {
      if (e.numericValue === nearest) {
        push(e, 'nearest', nearest,
          `لا تطابق مباشر — أقرب عدد متوفر في القاعدة إلى ${result.canonicalNumber} هو ${nearest}`);
      }
    }
  }

  // صدى الفواتح المقطّعة: فواتح تختزل إلى نفس العدد المرجعي — هوية حسابية فقط، بلا تفسير
  if (includeMuqattaatEcho) {
    const canonicals = muqattaatCanonicals();
    for (const entry of MUQATTAAT_ENTRIES) {
      const c = canonicals.get(entry.textExcerpt);
      if (c && c.canonicalNumber === result.canonicalNumber) {
        push(entry, 'muqattaat_echo', c.canonicalNumber,
          `فاتحة «${entry.textExcerpt}» (جُمَّلها ${c.total}) تختزل إلى نفس العدد ${c.canonicalNumber} — عرض جُمَّلي فقط، بلا تفسير`);
      }
    }
  }

  return suggestions.slice(0, limit);
}

export default suggestVerses;
