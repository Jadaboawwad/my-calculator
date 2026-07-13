// موازنة اسمين — مقارنة تراثية بحتة، بلا لغة نُصح أو تكهن.

import { isqat } from './isqat';
import { computeProfile } from './profile';

/**
 * يوازن بين اسمين حسب القاعدة التراثية: اختزال كل منهما (افتراضيًا على ٩، ويمكن ١٢ أو ٧)
 * ثم مقارنة الناتجين. النتيجة وصف لقاعدة حسابية من المصادر التراثية فقط.
 * @param {string} nameA
 * @param {string} nameB
 * @param {{ modulus?: 9|12|7, normalizeOptions?: object }} [options]
 */
export function mizan(nameA, nameB, options = {}) {
  const { modulus = 9, normalizeOptions = {} } = options;
  const profileA = computeProfile(nameA, { normalizeOptions });
  const profileB = computeProfile(nameB, { normalizeOptions });
  const valueA = isqat(profileA.kabir, modulus);
  const valueB = isqat(profileB.kabir, modulus);

  let outcome;
  if (valueA === valueB) {
    outcome = 'تعادل';
  } else if (valueA > valueB) {
    outcome = 'الاسم الأول أغلب';
  } else {
    outcome = 'الاسم الثاني أغلب';
  }

  return {
    nameA,
    nameB,
    modulus,
    valueA,
    valueB,
    outcome,
    profileA,
    profileB,
    note: 'حسب القاعدة التراثية — وصف لنمط حسابي في المصادر الكلاسيكية، وليس حكمًا أو توصية.',
  };
}

export default mizan;
