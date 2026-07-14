// مخزن إضافات المستخدم للوحدة القرآنية (SPEC §4) — localStorage مع إمكانية حقن مخزن بديل للاختبار.
// الإدخال بلا مصدر مسموح لكنه يُعلَّم «غير موثّق» في الواجهة (لا يُحذف، ولا يُعرض كحقيقة مؤكدة).

export const USER_VERSES_STORAGE_KEY = 'huruf.quranNumeric.v1';

function defaultStorage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** @returns {import('../data/quranNumeric').QuranNumericEntry[]} */
export function loadUserEntries(storage = defaultStorage()) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(USER_VERSES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserEntries(entries, storage) {
  if (!storage) return;
  try {
    storage.setItem(USER_VERSES_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // مساحة ممتلئة أو وضع خاص — الإضافة تبقى في الذاكرة للجلسة فقط
  }
}

/**
 * يضيف آية من المستخدم. المصدر اختياري تخزينًا لكن غيابه يجعلها «غير موثّقة» عرضًا.
 * @param {{surah: string, ayahNumber: number, textExcerpt: string, numericValue?: number, source?: string, note?: string}} input
 * @returns {import('../data/quranNumeric').QuranNumericEntry}
 */
export function addUserEntry(input, storage = defaultStorage()) {
  const surah = (input.surah || '').trim();
  const textExcerpt = (input.textExcerpt || '').trim();
  const ayahNumber = Number(input.ayahNumber);
  if (!surah || !textExcerpt || !Number.isInteger(ayahNumber) || ayahNumber < 1) {
    throw new Error('إضافة آية تتطلب: اسم السورة، رقم الآية (عدد صحيح موجب)، ونص الآية');
  }
  const numericValue = input.numericValue != null && input.numericValue !== ''
    ? Number(input.numericValue)
    : undefined;
  if (numericValue !== undefined && (!Number.isFinite(numericValue) || numericValue < 0)) {
    throw new Error('العدد الصريح إن أُدخل يجب أن يكون رقمًا موجبًا');
  }

  const entry = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    surah,
    ayahNumber,
    textExcerpt,
    category: 'user_curated',
    ...(numericValue !== undefined ? { numericValue } : {}),
    source: (input.source || '').trim(),
    ...(input.note ? { note: input.note.trim() } : {}),
    createdAt: new Date().toISOString(),
  };

  const entries = loadUserEntries(storage);
  entries.push(entry);
  saveUserEntries(entries, storage);
  return entry;
}

/** @param {string} id */
export function removeUserEntry(id, storage = defaultStorage()) {
  const entries = loadUserEntries(storage);
  const next = entries.filter((e) => e.id !== id);
  saveUserEntries(next, storage);
  return next;
}

export default loadUserEntries;
