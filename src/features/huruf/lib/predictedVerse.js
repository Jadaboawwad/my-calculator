// الآية المتنبأ بها — مدخل لمحرك الاختزال حسب قواعد الزمن والحروف

import { calculateHurufVerseNumber } from './verseFromHuruf';
import { gregorianToHijri } from './chronogram';
import { reduce } from './engine';
import { QURAN_NUMBER_VERSES } from '../data/quranNumbers';

const TOTAL_VERSES = 6236;
const API_BASE = 'https://api.alquran.cloud/v1/ayah';

/**
 * @typedef {Object} PredictedVerse
 * @property {number} verseNumber
 * @property {string|null} text
 * @property {string|null} surah
 * @property {number|null} ayah
 * @property {object} hurufMeta
 * @property {string[]} sourceTrace
 * @property {import('./engine').ReductionResult|null} reduction
 */

function dateParts(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

/** بحث محلي تقريبي — يختار آية من المعجم المحلي الأقرب لرقم الآية الكلي */
function localVerseFallback(verseNumber) {
  const mod = verseNumber % 30 || 30;
  const candidates = QURAN_NUMBER_VERSES.filter((v) => v.number === mod);
  if (candidates.length === 0) {
    const idx = verseNumber % QURAN_NUMBER_VERSES.length;
    const v = QURAN_NUMBER_VERSES[idx];
    return v ? { text: v.text, surah: v.surah, ayah: v.ayah } : null;
  }
  const pick = candidates[verseNumber % candidates.length];
  return { text: pick.text, surah: pick.surah, ayah: pick.ayah };
}

/**
 * يتنبأ برقم الآية وفق قواعد الزمن (استنطاق + جُمَّل + إسقاطات) — متزامن.
 * @param {Date} [date]
 * @param {object} [params]
 * @returns {Omit<PredictedVerse, 'text'|'reduction'> & { text: string|null, localFallback: boolean }}
 */
export function predictVerseNumber(date = new Date(), params = {}) {
  const { year, month, day, hours, minutes, seconds } = dateParts(date);
  const hijri = gregorianToHijri(year, month, day);

  const { verseNumber, hurufMeta } = calculateHurufVerseNumber({
    hours,
    minutes,
    seconds,
    gregorianDate: { year, month, day },
    hijriDate: { year: hijri.year, month: hijri.month, day: hijri.day },
    selectedNumber: params.selectedNumber ?? null,
    previousMarqumAnalysis: params.previousMarqumAnalysis ?? null,
  });

  const fallback = localVerseFallback(verseNumber);

  return {
    verseNumber: Math.min(Math.max(verseNumber, 1), TOTAL_VERSES),
    text: fallback?.text || null,
    surah: fallback?.surah || null,
    ayah: fallback?.ayah || null,
    hurufMeta,
    sourceTrace: ['rule-23', 'rule-33', 'rule-22', 'rule-13'],
    localFallback: Boolean(fallback),
    gregorianDate: { year, month, day },
    hijriDate: hijri,
  };
}

/**
 * جلب نص الآية من API (alquran.cloud) — غير متزامن.
 * @param {number} verseNumber
 */
export async function fetchVerseText(verseNumber) {
  try {
    const response = await fetch(`${API_BASE}/${verseNumber}/editions/quran-uthmani`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code !== 200 || !data.data?.length) return null;
    const verseData = data.data[0];
    return {
      text: verseData.text,
      surah: verseData.surah?.name || verseData.surah?.englishName,
      ayah: verseData.numberInSurah,
    };
  } catch {
    return null;
  }
}

/**
 * الآية المتنبأ بها كاملةً — رقم + نص + اختزال عبر المحرك الموحّد.
 * @param {Date} [date]
 * @param {object} [options]
 * @returns {Promise<PredictedVerse>}
 */
export async function predictVerseWithReduction(date = new Date(), options = {}) {
  const predicted = predictVerseNumber(date, options);
  let text = predicted.text;
  let surah = predicted.surah;
  let ayah = predicted.ayah;

  if (!text) {
    const fetched = await fetchVerseText(predicted.verseNumber);
    if (fetched) {
      text = fetched.text;
      surah = fetched.surah;
      ayah = fetched.ayah;
    }
  }

  let reduction = null;
  if (text) {
    reduction = reduce(
      { scale: 'text', raw: text },
      {
        depth: options.depth || 1,
        disclosureLevel: options.disclosureLevel || 'beginner',
        planetSchemeId: options.planetSchemeId,
        normalizeOptions: options.normalizeOptions,
      }
    );
    reduction.sourceTrace = [...new Set([...predicted.sourceTrace, ...reduction.sourceTrace])];
  }

  return {
    verseNumber: predicted.verseNumber,
    text,
    surah,
    ayah,
    hurufMeta: predicted.hurufMeta,
    sourceTrace: predicted.sourceTrace,
    reduction,
  };
}

export default predictVerseWithReduction;
