// الأنظمة البديلة (variants) — مصادر التراث تختلف في بعض الجداول، فهي هنا بيانات قابلة للاختيار
// وليست مُدمجة في المنطق الأساسي.

/** @typedef {'saturn'|'jupiter'|'mars'|'sun'|'venus'|'mercury'|'moon'} Planet */

// السبعة الأعلام بالترتيب الكلداني (من الأبعد إلى الأقرب): زحل، المشتري، المريخ، الشمس، الزهرة، عطارد، القمر
export const CHALDEAN_PLANETS = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

export const PLANET_LABELS = {
  saturn: 'زُحل',
  jupiter: 'المشتري',
  mars: 'المريخ',
  sun: 'الشمس',
  venus: 'الزهرة',
  mercury: 'عطارد',
  moon: 'القمر',
};

/**
 * مخطط توزيع الحروف الثمانية والعشرين على الكواكب السبعة.
 * @typedef {{ id: string, label: string, source: string, assign: (abjadIndex: number) => Planet }} PlanetScheme
 */

/** المخطط الافتراضي: توزيع دوري بترتيب الأبجد، أربعة حروف لكل كوكب (نمط شمس المعارف) */
const bunianScheme = {
  id: 'bunian',
  label: 'البنيان (توزيع دوري كلداني)',
  source: 'النمط الشائع في كتب التراث كـ"شمس المعارف" — توزيع دوري على ترتيب الأبجد',
  assign: (abjadIndex) => CHALDEAN_PLANETS[(abjadIndex - 1) % 7],
};

export const PLANET_SCHEMES = {
  bunian: bunianScheme,
};

export const DEFAULT_PLANET_SCHEME_ID = 'bunian';

// ---------------------------------------------------------------------------
// البروج الاثنا عشر — الجدول المداري (tropical) القياسي، مع الطبيعة والكوكب الحاكم
// ---------------------------------------------------------------------------

export const BURUJ = [
  { index: 1, name: 'الحمل', nature: 'fire', ruler: 'mars' },
  { index: 2, name: 'الثور', nature: 'earth', ruler: 'venus' },
  { index: 3, name: 'الجوزاء', nature: 'air', ruler: 'mercury' },
  { index: 4, name: 'السرطان', nature: 'water', ruler: 'moon' },
  { index: 5, name: 'الأسد', nature: 'fire', ruler: 'sun' },
  { index: 6, name: 'العذراء', nature: 'earth', ruler: 'mercury' },
  { index: 7, name: 'الميزان', nature: 'air', ruler: 'venus' },
  { index: 8, name: 'العقرب', nature: 'water', ruler: 'mars' },
  { index: 9, name: 'القوس', nature: 'fire', ruler: 'jupiter' },
  { index: 10, name: 'الجدي', nature: 'earth', ruler: 'saturn' },
  { index: 11, name: 'الدلو', nature: 'air', ruler: 'saturn' },
  { index: 12, name: 'الحوت', nature: 'water', ruler: 'jupiter' },
];

export const burjByIndex = (i) => BURUJ.find((b) => b.index === i);

// ---------------------------------------------------------------------------
// حساب الجُمَّل المغربي — يختلف عن المشرقي ابتداءً من حرف السين
// (المجموعات: صعفض، قرست، ثخذ، ظغش بدل سعفص، قرشت، ثخذ، ضظغ)
// ---------------------------------------------------------------------------

export const ABJAD_MAGHRIBI_VALUES = {
  ا: 1, ب: 2, ج: 3, د: 4, ه: 5, و: 6, ز: 7, ح: 8, ط: 9, ي: 10,
  ك: 20, ل: 30, م: 40, ن: 50,
  ص: 60, ع: 70, ف: 80, ض: 90,
  ق: 100, ر: 200, س: 300, ت: 400,
  ث: 500, خ: 600, ذ: 700,
  ظ: 800, غ: 900, ش: 1000,
};

export const VALUE_SCHEMES = {
  mashriqi: { id: 'mashriqi', label: 'مشرقي (الافتراضي)' },
  maghribi: { id: 'maghribi', label: 'مغربي' },
};

export const DEFAULT_VALUE_SCHEME_ID = 'mashriqi';
