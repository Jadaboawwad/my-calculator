// الإسقاط — اختزال دوري (modular) مع قاعدة "خذه صحيحًا مكمَّلا": الباقي صفر يعود إلى القيمة الكاملة، لا صفر.

/**
 * @param {number} n
 * @param {number} modulus
 * @returns {number} قيمة بين 1 و modulus (شاملة الطرفين)، لا تُرجع صفرًا أبدًا
 */
export function isqat(n, modulus) {
  if (!Number.isFinite(modulus) || modulus <= 0) {
    throw new Error('isqat: modulus must be a positive number');
  }
  return ((n - 1) % modulus + modulus) % modulus + 1;
}

/** جدول الإسقاطات الجاهزة المستعملة تراثيًا */
export const ISQAT_PRESETS = {
  4: { modulus: 4, label: '٤ — الأركان (الطبائع)' },
  7: { modulus: 7, label: '٧ — الكواكب' },
  9: { modulus: 9, label: '٩ — الطاء (للطبائع والميزان)' },
  12: { modulus: 12, label: '١٢ — البروج (الدور)' },
  28: { modulus: 28, label: '٢٨ — المنازل (الحروف)' },
};

export const isqat9 = (n) => isqat(n, 9);
export const isqat12 = (n) => isqat(n, 12);
export const isqat28 = (n) => isqat(n, 28);
export const isqat7 = (n) => isqat(n, 7);
export const isqat4 = (n) => isqat(n, 4);

export default isqat;
