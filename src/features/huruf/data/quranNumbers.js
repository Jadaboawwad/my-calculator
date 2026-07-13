// معجم بذرة (seed lexicon) لأداة التأريخ الشعري — مُشتق من قاعدة الآيات القرآنية التي تحوي أرقامًا
// الموجودة أصلًا في هذا المشروع (Quranicnumbersdatabase.js في جذر المستودع)، لا نصوصًا جديدة.
//
// ملاحظة أمانة نقل: تُغطّي القاعدة المصدرية ٣٠ رقمًا مميزًا (١..١٢، ١٩، ٢٠، ٣٠..٩٩، ١٠٠..٣٠٠،
// ١٠٠٠..١٠٠٠٠٠) عبر ١٣٦ آية. لم نُضِف آيات جديدة لبلوغ رقم "٣٤" الوارد في بعض المصادر الثانوية
// عن عدد الآيات ذات الأرقام في القرآن، تجنبًا لنسبة نصّ قرآني غير مُتحقَّق منه لهذه الوحدة.

import { quranicNumbersDatabase } from '../../../../Quranicnumbersdatabase';

/**
 * @typedef {Object} QuranNumberEntry
 * @property {number} number
 * @property {string} surah
 * @property {number} ayah
 * @property {string} text
 */

/** @type {QuranNumberEntry[]} */
export const QURAN_NUMBER_VERSES = Object.entries(quranicNumbersDatabase).flatMap(
  ([numberKey, entry]) =>
    (entry.verses || []).map((v) => ({
      number: Number(numberKey),
      surah: v.surah,
      ayah: v.ayah,
      text: v.text,
    }))
);

export const QURAN_NUMBER_KEYS = Object.keys(quranicNumbersDatabase)
  .map(Number)
  .sort((a, b) => a - b);

export const versesForNumber = (n) => QURAN_NUMBER_VERSES.filter((v) => v.number === n);

export default QURAN_NUMBER_VERSES;
