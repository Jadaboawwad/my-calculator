// الآية المختارة — اختيار آية توضيحي، لا تكهني، مبني على تاريخ اليوم مُختزلًا بإسقاط ٩
// (نفس قاعدة lib/isqat.js المستعملة في بقية الوحدة)، ثم عرض آية من المعجم المتوفر محليًا
// (data/quranNumbers.js، المشتق من قاعدة البيانات المتحقَّق منها في المشروع).

import { isqat } from './isqat';
import { QURAN_NUMBER_KEYS, versesForNumber } from '../data/quranNumbers';

/**
 * يختزل تاريخًا معينًا إلى رقم بين ١ و٩ بإسقاط ٩ (سنة+شهر+يوم).
 * @param {Date} [date]
 */
export function dateSeedNumber(date = new Date()) {
  const seed = date.getFullYear() + (date.getMonth() + 1) + date.getDate();
  return isqat(seed, 9);
}

/** أقرب رقم متوفر في المعجم المحلي لرقم مطلوب (المعجم لا يغطي كل الأرقام) */
export function nearestAvailableNumber(target, availableKeys = QURAN_NUMBER_KEYS) {
  return availableKeys.reduce((best, k) =>
    Math.abs(k - target) < Math.abs(best - target) ? k : best
  );
}

/**
 * الآية المختارة لتاريخ معيّن — عرض توضيحي لآلية الاستنطاق/الإسقاط، وليس تكهنًا أو توصية.
 * @param {Date} [date]
 * @returns {{ dateNumber: number, matchedNumber: number, verse: import('../data/quranNumbers').QuranNumberEntry|null }}
 */
export function verseOfTheDay(date = new Date()) {
  const dateNumber = dateSeedNumber(date);
  const matchedNumber = nearestAvailableNumber(dateNumber);
  const verses = versesForNumber(matchedNumber);
  if (verses.length === 0) return { dateNumber, matchedNumber, verse: null };

  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const verse = verses[dayOfYear % verses.length];
  return { dateNumber, matchedNumber, verse };
}

export default verseOfTheDay;
