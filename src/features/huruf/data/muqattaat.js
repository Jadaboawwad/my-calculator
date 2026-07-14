// الحروف المقطّعة — فواتح السور التسع والعشرين، مجمّعة حسب الفاتحة (١٤ صيغة).
// مصدر التصنيف: المصحف — فواتح السور المذكورة (توثيق لغوي/تاريخي، لا ادّعاء تفسيري).
//
// منقول ومصحَّح من muqattaatDatabase في KitabMarqumSystem.js القديم، الذي كان ينقصه
// «المص» و«المر» و«طه»، ويفصل «حم عسق» (الشورى) إلى فاتحتين.

/**
 * @typedef {Object} MuqattaatGroup
 * @property {string} opener        الفاتحة كما تُكتب (مثل «الم»)
 * @property {string[]} letters     حروفها مفردة
 * @property {number[]} surahs      أرقام السور في المصحف
 * @property {string[]} surahNames  أسماء السور بالترتيب نفسه
 * @property {string} description   نطق الحروف
 */

/** @type {MuqattaatGroup[]} */
export const MUQATTAAT_GROUPS = [
  { opener: 'الم', letters: ['ا', 'ل', 'م'], surahs: [2, 3, 29, 30, 31, 32], surahNames: ['البقرة', 'آل عمران', 'العنكبوت', 'الروم', 'لقمان', 'السجدة'], description: 'ألف، لام، ميم' },
  { opener: 'المص', letters: ['ا', 'ل', 'م', 'ص'], surahs: [7], surahNames: ['الأعراف'], description: 'ألف، لام، ميم، صاد' },
  { opener: 'الر', letters: ['ا', 'ل', 'ر'], surahs: [10, 11, 12, 14, 15], surahNames: ['يونس', 'هود', 'يوسف', 'إبراهيم', 'الحجر'], description: 'ألف، لام، را' },
  { opener: 'المر', letters: ['ا', 'ل', 'م', 'ر'], surahs: [13], surahNames: ['الرعد'], description: 'ألف، لام، ميم، را' },
  { opener: 'كهيعص', letters: ['ك', 'ه', 'ي', 'ع', 'ص'], surahs: [19], surahNames: ['مريم'], description: 'كاف، ها، يا، عين، صاد' },
  { opener: 'طه', letters: ['ط', 'ه'], surahs: [20], surahNames: ['طه'], description: 'طا، ها' },
  { opener: 'طسم', letters: ['ط', 'س', 'م'], surahs: [26, 28], surahNames: ['الشعراء', 'القصص'], description: 'طا، سين، ميم' },
  { opener: 'طس', letters: ['ط', 'س'], surahs: [27], surahNames: ['النمل'], description: 'طا، سين' },
  { opener: 'يس', letters: ['ي', 'س'], surahs: [36], surahNames: ['يس'], description: 'يا، سين' },
  { opener: 'ص', letters: ['ص'], surahs: [38], surahNames: ['ص'], description: 'صاد' },
  { opener: 'حم', letters: ['ح', 'م'], surahs: [40, 41, 43, 44, 45, 46], surahNames: ['غافر', 'فصلت', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف'], description: 'حا، ميم' },
  { opener: 'حم عسق', letters: ['ح', 'م', 'ع', 'س', 'ق'], surahs: [42], surahNames: ['الشورى'], description: 'حا، ميم، عين، سين، قاف' },
  { opener: 'ق', letters: ['ق'], surahs: [50], surahNames: ['ق'], description: 'قاف' },
  { opener: 'ن', letters: ['ن'], surahs: [68], surahNames: ['القلم'], description: 'نون' },
];

/** عدد السور ذات الفواتح — ثابت مرجعي للاختبارات */
export const MUQATTAAT_SURAH_COUNT = 29;

export const MUQATTAAT_SOURCE = 'المصحف — فواتح السور المذكورة';

/** @param {string} opener */
export const groupByOpener = (opener) => MUQATTAAT_GROUPS.find((g) => g.opener === opener);

/** @param {string} opener @returns {{surah: number, name: string}[]} */
export const surahsWithOpener = (opener) => {
  const g = groupByOpener(opener);
  if (!g) return [];
  return g.surahs.map((s, i) => ({ surah: s, name: g.surahNames[i] }));
};

export default MUQATTAAT_GROUPS;
