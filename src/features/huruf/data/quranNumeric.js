// الوحدة القرآنية (SPEC v2 §4) — منسقة من مصادر المشروع، لا مُختلقة.
// البذرة: (١) فواتح السور المقطّعة — قيمة جُمَّلية تُحسب حيًّا بلا أي تفسير أو ادّعاء،
// (٢) آيات الأعداد الصريحة من قاعدة المشروع المحلية (Quranicnumbersdatabase.js — ١٣٦ آية).
// إضافات المستخدم تُخزَّن محليًا (lib/userVerses.js) ويُعلَّم ما لا مصدر له «غير موثّق».

import { MUQATTAAT_GROUPS, MUQATTAAT_SOURCE } from './muqattaat';
import { QURAN_NUMBER_VERSES } from './quranNumbers';

/**
 * @typedef {Object} QuranNumericEntry
 * @property {string} id
 * @property {string} surah          اسم السورة
 * @property {number} ayahNumber
 * @property {string} textExcerpt
 * @property {'muqattaat'|'explicit_number'|'user_curated'} category
 * @property {number} [numericValue] العدد الصريح في الآية إن وجد
 * @property {string} source         مرجع التصنيف — إلزامي؛ الفارغ يُعلَّم «غير موثّق»
 * @property {string} [note]
 */

export const QURAN_NUMERIC_CATEGORIES = {
  muqattaat: 'الحروف المقطّعة',
  explicit_number: 'أعداد صريحة',
  user_curated: 'إضافات المستخدم',
};

/** فواتح السور التسع والعشرين — بلا numericValue: القيمة تُحسب حيًّا عبر المحرك، عرضًا فقط */
/** @type {QuranNumericEntry[]} */
export const MUQATTAAT_ENTRIES = MUQATTAAT_GROUPS.flatMap((g) =>
  g.surahs.map((surahNo, i) => ({
    id: `muqattaat-${surahNo}`,
    surah: g.surahNames[i],
    ayahNumber: 1,
    textExcerpt: g.opener,
    category: 'muqattaat',
    source: MUQATTAAT_SOURCE,
    note: `فاتحة سورة ${g.surahNames[i]} (${g.description}) — عرض جُمَّلي فقط، بلا تفسير`,
  }))
);

/** آيات الأعداد الصريحة — من قاعدة المشروع المحلية */
/** @type {QuranNumericEntry[]} */
export const EXPLICIT_NUMBER_ENTRIES = QURAN_NUMBER_VERSES.map((v) => ({
  id: `explicit-${v.surah}-${v.ayah}-${v.number}`,
  surah: v.surah,
  ayahNumber: v.ayah,
  textExcerpt: v.text,
  category: 'explicit_number',
  numericValue: v.number,
  source: 'قاعدة الأرقام القرآنية المحلية للمشروع (Quranicnumbersdatabase.js)',
}));

/** @type {QuranNumericEntry[]} */
export const SEED_ENTRIES = [...MUQATTAAT_ENTRIES, ...EXPLICIT_NUMBER_ENTRIES];

/** @param {QuranNumericEntry} e */
export const isDocumented = (e) => Boolean(e && typeof e.source === 'string' && e.source.trim());

export default SEED_ENTRIES;
