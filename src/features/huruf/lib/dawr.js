// محرك الدور — موضع أي عدد على دولاب المراتب العشر، والبروج الاثني عشر، والكواكب السبعة.

import { isqat } from './isqat';
import { burjByIndex, CHALDEAN_PLANETS } from '../data/schemes';

/**
 * @param {number} n
 * @returns {{
 *   rank10: number, isRankPivot: boolean,
 *   burjIndex: number, burj: ReturnType<typeof burjByIndex>,
 *   planetIndex: number, planet: string,
 * }}
 */
export function dawrOf(n) {
  const rank10 = isqat(n, 10);
  const burjIndex = isqat(n, 12);
  const planetIndex = isqat(n, 7);
  return {
    rank10,
    isRankPivot: rank10 === 10, // الياء: تمام المراتب — إغلاق الدولاب وولادة الألف من جديد
    burjIndex,
    burj: burjByIndex(burjIndex),
    planetIndex,
    planet: CHALDEAN_PLANETS[planetIndex - 1],
  };
}

/**
 * أقرب عدد بعد n يقع على البرج المطلوب — يستعمله دولاب الواجهة لعرض "الدور القادم".
 * مثال: إلى صورة الميزان (البرج السابع) في ختام المنظومة.
 * @param {number} n
 * @param {number} targetBurjIndex 1..12
 * @returns {number}
 */
export function nextAlignment(n, targetBurjIndex) {
  if (targetBurjIndex < 1 || targetBurjIndex > 12) {
    throw new Error('nextAlignment: targetBurjIndex must be 1..12');
  }
  let candidate = n;
  for (let i = 0; i < 12; i++) {
    candidate += 1;
    if (isqat(candidate, 12) === targetBurjIndex) return candidate;
  }
  return candidate; // لن يُصل إليه فعليًا؛ الدورة مضمونة الإغلاق خلال ١٢ خطوة
}

export default dawrOf;
