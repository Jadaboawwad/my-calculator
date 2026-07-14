// مطابقة أي آية من كامل المصحف مع نتيجة المحرك الموحد — لا الآيات الرقمية فقط.
// كل آية تُحسب بنفس قواعد النظام حرفيًا (normalize → jummal → isqat)، ويُبحث أيضًا
// عمّا استُنطق من العدد (numberToLetters) كلفظٍ داخل الآيات. المطابقة حسابية وصفية
// فقط — لا ادّعاء تفسيري (SPEC §4/§6).

import { jummalKabir } from './jummal';
import { isqat } from './isqat';
import { numberToLetters } from './istintaq';
import { normalizeText } from './normalize';
import { CANONICAL_MODULUS } from './engine';
import { QURAN_API_SOURCE_LABEL } from './quranApi';

export const QURAN_MATCH_TYPE_LABELS = {
  quran_total: 'تطابق الجُمَّل الكبير — كامل المصحف',
  quran_canonical: 'نفس العدد المرجعي — كامل المصحف',
  quran_istintaq: 'الآية تنطق باستنطاق العدد',
};

/**
 * @typedef {Object} IndexedAyah
 * @property {number} surahNumber
 * @property {string} surahName
 * @property {number} ayahNumber
 * @property {string} text
 * @property {number} total       الجُمَّل الكبير للآية بنفس قواعد التطبيع الفعّالة
 * @property {number} canonical   إسقاط ١٠ (الياء)
 *
 * @typedef {Object} QuranIndex
 * @property {IndexedAyah[]} verses
 * @property {Map<number, IndexedAyah[]>} byTotal
 * @property {Map<number, IndexedAyah[]>} byCanonical
 * @property {Map<string, IndexedAyah[]>} byWord   كلمات الآية بعد التطبيع
 */

/**
 * يفهرس كامل المصحف عبر نفس دوال النظام — يُحسب مرة واحدة ثم تُستعمل الفهارس.
 * @param {import('./quranApi').QuranAyah[]} corpus
 * @param {import('./normalize').NormalizeOptions & {valueScheme?: 'mashriqi'|'maghribi'}} [computeOptions]
 * @returns {QuranIndex}
 */
export function buildQuranIndex(corpus, computeOptions = {}) {
  const verses = [];
  const byTotal = new Map();
  const byCanonical = new Map();
  const byWord = new Map();

  const pushTo = (map, key, verse) => {
    const list = map.get(key);
    if (list) list.push(verse);
    else map.set(key, [verse]);
  };

  for (const ayah of corpus) {
    const { total } = jummalKabir(ayah.text, computeOptions);
    if (total <= 0) continue;
    const verse = {
      surahNumber: ayah.surahNumber,
      surahName: ayah.surahName,
      ayahNumber: ayah.ayahNumber,
      text: ayah.text,
      total,
      canonical: isqat(total, CANONICAL_MODULUS),
    };
    verses.push(verse);
    pushTo(byTotal, verse.total, verse);
    pushTo(byCanonical, verse.canonical, verse);

    const seenWords = new Set();
    for (const rawWord of ayah.text.split(/\s+/)) {
      const word = normalizeText(rawWord, computeOptions).normalized;
      if (word.length < 2 || seenWords.has(word)) continue;
      seenWords.add(word);
      pushTo(byWord, word, verse);
    }
  }

  return { verses, byTotal, byCanonical, byWord };
}

/** يحوّل آية مفهرسة إلى شكل QuranNumericEntry الموحّد في العرض */
function toEntry(verse, note) {
  return {
    id: `quran-${verse.surahNumber}-${verse.ayahNumber}`,
    surah: verse.surahName,
    surahNumber: verse.surahNumber,
    ayahNumber: verse.ayahNumber,
    textExcerpt: verse.text,
    category: 'quran_api',
    source: QURAN_API_SOURCE_LABEL,
    ...(note ? { note } : {}),
  };
}

/**
 * يطابق نتيجة اختزال مع كامل المصحف — ثلاث درجات، من الأقوى إلى الأعم:
 * ١) جُمَّل الآية = الجُمَّل الكبير للمدخل (تطابق تام).
 * ٢) الآية تحوي لفظ استنطاق العدد ككلمة قائمة (R13).
 * ٣) الآية تختزل إلى نفس العدد المرجعي (إسقاط ١٠) — تُرتَّب بالأقرب جُمَّلًا وتُحدّ.
 * @param {import('./engine').ReductionResult} result
 * @param {QuranIndex} index
 * @param {{limit?: number, totalLimit?: number, istintaqLimit?: number}} [opts]
 * @returns {import('./verseSuggest').VerseSuggestion[]}
 */
export function matchQuranVerses(result, index, opts = {}) {
  const { limit = 10, totalLimit = 4, istintaqLimit = 3 } = opts;
  const matches = [];
  const seen = new Set();

  const push = (verse, matchType, matchedValue, trace, ruleIds) => {
    const key = `${verse.surahNumber}:${verse.ayahNumber}`;
    if (seen.has(key) || matches.length >= limit) return;
    seen.add(key);
    matches.push({
      entry: toEntry(verse),
      matchType,
      matchedValue,
      trace,
      ruleIds,
      documented: true,
    });
  };

  // ١ — تطابق الجُمَّل الكبير التام
  for (const verse of (index.byTotal.get(result.total) || []).slice(0, totalLimit)) {
    push(
      verse,
      'quran_total',
      result.total,
      `جُمَّل الآية بنفس قواعد النظام = ${verse.total} — يطابق الجُمَّل الكبير للمدخل تمامًا`,
      ['R17', 'R32']
    );
  }

  // ٢ — الآية تحوي لفظ استنطاق العدد ككلمة قائمة
  let istintaqText = null;
  try {
    istintaqText = numberToLetters(result.total).text;
  } catch {
    istintaqText = null;
  }
  if (istintaqText && istintaqText.length >= 2) {
    for (const verse of (index.byWord.get(istintaqText) || []).slice(0, istintaqLimit)) {
      push(
        verse,
        'quran_istintaq',
        result.total,
        `استنطاق العدد ${result.total} هو «${istintaqText}» — وهو لفظ وارد في الآية`,
        ['R13', 'R32']
      );
    }
  }

  // ٣ — نفس العدد المرجعي: تُرتَّب بالأقرب في الجُمَّل الكبير ثم تُحدّ
  if (matches.length < limit) {
    const canonicalPool = (index.byCanonical.get(result.canonicalNumber) || [])
      .filter((v) => !seen.has(`${v.surahNumber}:${v.ayahNumber}`))
      .sort((a, b) => Math.abs(a.total - result.total) - Math.abs(b.total - result.total));
    for (const verse of canonicalPool) {
      if (matches.length >= limit) break;
      push(
        verse,
        'quran_canonical',
        result.canonicalNumber,
        `جُمَّل الآية ${verse.total} يختزل بإسقاط ١٠ (الياء) إلى ${verse.canonical} — نفس العدد المرجعي للمدخل`,
        ['R17', 'R18', 'R32']
      );
    }
  }

  return matches;
}

export default matchQuranVerses;
