// التأريخ الشعري (chronogram) — فكّ وصياغة، وتقويم هجري⇄ميلادي حسابي تقريبي.

import { jummalKabir } from './jummal';
import { numberToLetters } from './istintaq';
import { QURAN_NUMBER_VERSES } from '../data/quranNumbers';

const MAX_SUBSET_WORDS = 20; // 2^20 تركيبة كحد أقصى — يحمي من الانفجار التوافقي

/**
 * فكّ تاريخ شعري: يحسب جُمَّل كل كلمة، ويبحث (إن أُعطي عام مستهدف) عن كل مجموعة كلمات
 * متتالية أو متفرقة يساوي مجموعها ذلك العام.
 * @param {string} verseText
 * @param {number|null} [targetYear]
 * @param {import('./normalize').NormalizeOptions} [options]
 */
export function decodeChronogram(verseText, targetYear = null, options = {}) {
  const words = verseText.split(/\s+/).filter(Boolean);
  const wordSums = words.map((w) => jummalKabir(w, options).total);
  const total = wordSums.reduce((a, b) => a + b, 0);

  const matchingSubsets = [];
  if (targetYear != null && words.length > 0 && words.length <= MAX_SUBSET_WORDS) {
    const n = words.length;
    for (let mask = 1; mask < (1 << n); mask++) {
      let sum = 0;
      const indices = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          sum += wordSums[i];
          indices.push(i);
        }
      }
      if (sum === targetYear) {
        matchingSubsets.push({ indices, words: indices.map((i) => words[i]) });
      }
    }
  }

  return { words, wordSums, total, targetYear, matchingSubsets, truncated: words.length > MAX_SUBSET_WORDS };
}

// معجم بذرة صغير جدًا لأسماء الأعداد العربية — يُستعمل فقط لمطابقة تجريبية في صياغة التاريخ
const NUMBER_WORDS = ['واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];

/**
 * صياغة تاريخ: يقترح تفكيك العدد إلى حروف (استنطاق)، ويطابق كلمات من معجم بذرة صغير
 * ومن نصوص الآيات ذات الأرقام المتوفرة محليًا — علامة على الاحتمال فقط، لا قائمة شاملة.
 * @param {number} targetYear
 * @param {import('./normalize').NormalizeOptions} [options]
 */
export function composeChronogram(targetYear, options = {}) {
  const letterSuggestion = numberToLetters(targetYear);

  const candidateWords = new Set([
    ...NUMBER_WORDS,
    ...QURAN_NUMBER_VERSES.flatMap((v) => v.text.split(/\s+/)),
  ]);

  const lexiconMatches = [];
  for (const word of candidateWords) {
    if (jummalKabir(word, options).total === targetYear) lexiconMatches.push(word);
  }

  return { targetYear, letterSuggestion, lexiconMatches };
}

// ---------------------------------------------------------------------------
// تقويم هجري⇄ميلادي حسابي تقريبي (Tabular Islamic Calendar) — وفق الصيغ الحسابية القياسية
// المنشورة للتقويم الهجري الجدولي، وليس المرصود فلكيًا.
// ---------------------------------------------------------------------------

const ISLAMIC_EPOCH_JDN = 1948440; // اليوم الجولياني لأول محرم سنة ١ هـ (تقويم جدولي حسابي)

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function islamicToJDN(year, month, day) {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH_JDN -
    1
  );
}

function jdnToIslamic(jdn) {
  const islamicYear = Math.floor((30 * (jdn - ISLAMIC_EPOCH_JDN) + 10646) / 10631);
  let month = Math.min(12, Math.ceil((jdn - 29 - islamicToJDN(islamicYear, 1, 1)) / 29.5) + 1);
  if (month < 1) month = 1;
  const day = jdn - islamicToJDN(islamicYear, month, 1) + 1;
  return { year: islamicYear, month, day };
}

/** @param {number} hYear @param {number} hMonth @param {number} hDay */
export function hijriToGregorian(hYear, hMonth, hDay) {
  const { year, month, day } = jdnToGregorian(islamicToJDN(hYear, hMonth, hDay));
  return { year, month, day, approximate: true };
}

/** @param {number} gYear @param {number} gMonth @param {number} gDay */
export function gregorianToHijri(gYear, gMonth, gDay) {
  const { year, month, day } = jdnToIslamic(gregorianToJDN(gYear, gMonth, gDay));
  return { year, month, day, approximate: true };
}

export default decodeChronogram;
