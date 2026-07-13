// الوحدة القرآنية — منسقة من المستخدم، لا مُختلقة
// البذرة الافتراضية: الحروف المقطّعة في فواتح ٢٩ سورة فقط

const STORAGE_KEY = 'huruf.quran-numeric.v1';

/**
 * @typedef {'muqattaat'|'explicit_number'|'user_curated'} QuranNumericCategory
 */

/**
 * @typedef {Object} QuranNumericEntry
 * @property {string} id
 * @property {string} surah
 * @property {number} ayahNumber
 * @property {string} textExcerpt
 * @property {QuranNumericCategory} category
 * @property {number} [numericValue]
 * @property {string} source
 * @property {string} [note]
 * @property {boolean} [undocumented]
 */

/** بذرة الحروف المقطّعة — تصنيف لغوي/تاريخي معروف، بلا تفسير يتجاوز إظهار الرقم */
/** @type {QuranNumericEntry[]} */
export const MUQATTAAT_SEED = [
  { id: 'mq-2', surah: 'البقرة', ayahNumber: 1, textExcerpt: 'الم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة (تصنيف لغوي معروف)' },
  { id: 'mq-3', surah: 'آل عمران', ayahNumber: 1, textExcerpt: 'الم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-7', surah: 'الأعراف', ayahNumber: 1, textExcerpt: 'المص', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-10', surah: 'يونس', ayahNumber: 1, textExcerpt: 'الر', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-11', surah: 'هود', ayahNumber: 1, textExcerpt: 'الر', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-12', surah: 'يوسف', ayahNumber: 1, textExcerpt: 'الر', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-13', surah: 'الرعد', ayahNumber: 1, textExcerpt: 'المر', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-14', surah: 'إبراهيم', ayahNumber: 1, textExcerpt: 'الر', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-15', surah: 'الحجر', ayahNumber: 1, textExcerpt: 'الر', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-19', surah: 'مريم', ayahNumber: 1, textExcerpt: 'كهيعص', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-20', surah: 'طه', ayahNumber: 1, textExcerpt: 'طه', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-26', surah: 'الشعراء', ayahNumber: 1, textExcerpt: 'طسم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-27', surah: 'النمل', ayahNumber: 1, textExcerpt: 'طس', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-28', surah: 'القصص', ayahNumber: 1, textExcerpt: 'طسم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-29', surah: 'العنكبوت', ayahNumber: 1, textExcerpt: 'الم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-30', surah: 'الروم', ayahNumber: 1, textExcerpt: 'الم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-31', surah: 'لقمان', ayahNumber: 1, textExcerpt: 'الم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-32', surah: 'السجدة', ayahNumber: 1, textExcerpt: 'الم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-36', surah: 'يس', ayahNumber: 1, textExcerpt: 'يس', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-38', surah: 'ص', ayahNumber: 1, textExcerpt: 'ص', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-40', surah: 'غافر', ayahNumber: 1, textExcerpt: 'حم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-41', surah: 'فصلت', ayahNumber: 1, textExcerpt: 'حم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-42', surah: 'الشورى', ayahNumber: 1, textExcerpt: 'حم عسق', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-43', surah: 'الزخرف', ayahNumber: 1, textExcerpt: 'حم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-44', surah: 'الدخان', ayahNumber: 1, textExcerpt: 'حم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-45', surah: 'الجاثية', ayahNumber: 1, textExcerpt: 'حم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-46', surah: 'الأحقاف', ayahNumber: 1, textExcerpt: 'حم', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-50', surah: 'ق', ayahNumber: 1, textExcerpt: 'ق', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
  { id: 'mq-68', surah: 'القلم', ayahNumber: 1, textExcerpt: 'ن', category: 'muqattaat', source: 'فتح السور — الحروف المقطّعة' },
];

function loadUserEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllQuranNumericEntries() {
  const user = loadUserEntries();
  return [...MUQATTAAT_SEED, ...user];
}

/**
 * @param {{ surah: string, ayahNumber: number, textExcerpt: string, source: string, numericValue?: number, note?: string }} entry
 */
export function addUserQuranEntry(entry) {
  const source = (entry.source || '').trim();
  const newEntry = {
    id: `user-${Date.now()}`,
    surah: entry.surah,
    ayahNumber: entry.ayahNumber,
    textExcerpt: entry.textExcerpt,
    category: 'user_curated',
    numericValue: entry.numericValue,
    source: source || 'غير موثّق',
    note: entry.note,
    undocumented: !source,
  };
  const user = loadUserEntries();
  user.push(newEntry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // localStorage غير متاح
  }
  return newEntry;
}

export default MUQATTAAT_SEED;
