// جدول الحروف الأساسي — المصدر الوحيد للحقيقة (single source of truth)
// ترتيب أبجدي: أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ

/** @typedef {'fire'|'air'|'water'|'earth'} Nature */

// حساب الجمل الكبير المشرقي بترتيب الأبجد (١..١٠٠٠)
const ABJAD_ORDER = [
  { char: 'ا', name: 'ألف', kabir: 1 },
  { char: 'ب', name: 'باء', kabir: 2 },
  { char: 'ج', name: 'جيم', kabir: 3 },
  { char: 'د', name: 'دال', kabir: 4 },
  { char: 'ه', name: 'هاء', kabir: 5 },
  { char: 'و', name: 'واو', kabir: 6 },
  { char: 'ز', name: 'زاي', kabir: 7 },
  { char: 'ح', name: 'حاء', kabir: 8 },
  { char: 'ط', name: 'طاء', kabir: 9 },
  { char: 'ي', name: 'ياء', kabir: 10 },
  { char: 'ك', name: 'كاف', kabir: 20 },
  { char: 'ل', name: 'لام', kabir: 30 },
  { char: 'م', name: 'ميم', kabir: 40 },
  { char: 'ن', name: 'نون', kabir: 50 },
  { char: 'س', name: 'سين', kabir: 60 },
  { char: 'ع', name: 'عين', kabir: 70 },
  { char: 'ف', name: 'فاء', kabir: 80 },
  { char: 'ص', name: 'صاد', kabir: 90 },
  { char: 'ق', name: 'قاف', kabir: 100 },
  { char: 'ر', name: 'راء', kabir: 200 },
  { char: 'ش', name: 'شين', kabir: 300 },
  { char: 'ت', name: 'تاء', kabir: 400 },
  { char: 'ث', name: 'ثاء', kabir: 500 },
  { char: 'خ', name: 'خاء', kabir: 600 },
  { char: 'ذ', name: 'ذال', kabir: 700 },
  { char: 'ض', name: 'ضاد', kabir: 800 },
  { char: 'ظ', name: 'ظاء', kabir: 900 },
  { char: 'غ', name: 'غين', kabir: 1000 },
];

// الترتيب الهجائي (المعجمي) للعرض البديل فقط
const HIJAI_ORDER_CHARS = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
];

/** الطبائع الأربع بالترتيب الدوري: نار، هواء، ماء، تراب — كل رابع حرف من ترتيب الأبجد */
const NATURE_CYCLE = ['fire', 'air', 'water', 'earth'];

// الإسقاط إلى ٩ مع قاعدة "خذه صحيحًا مكمَّلا": الباقي صفر يعود إلى ٩ لا صفر
export function reduceMod9(n) {
  const r = n % 9;
  return r === 0 ? 9 : r;
}

// المرتبة: الياء (١٠) هي "تمام المراتب" وتُفرد برقم ١٠؛ سائر الحروف تُختزل إلى رقمها الآحادي
// عبر أول رقم معنوي في قيمتها (فمثلاً ك=٢٠ رتبتها ٢، غ=١٠٠٠ رتبتها ١)
function computeRank(kabir) {
  if (kabir === 10) return 10;
  return Number(String(kabir)[0]);
}

export const HURUF_LETTERS = ABJAD_ORDER.map((entry, idx) => {
  const abjadIndex = idx + 1; // 1..28
  const natureIdx = idx % 4; // دوري كل ٤ حروف
  return {
    char: entry.char,
    name: entry.name,
    abjadIndex,
    hijaiIndex: HIJAI_ORDER_CHARS.indexOf(entry.char) + 1,
    kabir: entry.kabir,
    saghir: reduceMod9(entry.kabir),
    rank: computeRank(entry.kabir),
    nature: NATURE_CYCLE[natureIdx],
    natureOrder: Math.floor(idx / 4) + 1, // 1..7 داخل طبيعتها
  };
});

export const NATURE_LABELS = {
  fire: { ar: 'نار', color: '#B5432A' },
  air: { ar: 'هواء', color: '#C9A227' },
  water: { ar: 'ماء', color: '#2E6E8E' },
  earth: { ar: 'تراب', color: '#6B4F2A' },
};

export const NATURE_ORDER = ['fire', 'air', 'water', 'earth'];

export const letterByChar = (char) => HURUF_LETTERS.find((l) => l.char === char);
export const letterByAbjadIndex = (i) => HURUF_LETTERS.find((l) => l.abjadIndex === i);
export const letterByKabir = (kabir) => HURUF_LETTERS.find((l) => l.kabir === kabir);

// جدول الطبائع الأربع كما ورد في المنظومة — يُستخدم كبيّنة اختبار (test fixture) للقاعدة الدورية أعلاه
export const NATURE_TABLE_FIXTURE = {
  fire: ['ا', 'ه', 'ط', 'م', 'ف', 'ش', 'ذ'],
  air: ['ب', 'و', 'ي', 'ن', 'ص', 'ت', 'ض'],
  water: ['ج', 'ز', 'ك', 'س', 'ق', 'ث', 'ظ'],
  earth: ['د', 'ح', 'ل', 'ع', 'ر', 'خ', 'غ'],
};

export default HURUF_LETTERS;
