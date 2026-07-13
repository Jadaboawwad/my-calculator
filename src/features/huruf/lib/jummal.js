// حساب الجُمَّل — الجمل الكبير (قيم الآحاد..الألف) والجمل الصغير (اختزال إلى ٩)

import { normalizeText } from './normalize';
import { letterByChar, reduceMod9 } from '../data/letters';
import { ABJAD_MAGHRIBI_VALUES } from '../data/schemes';

/**
 * @typedef {Object} LetterTrace
 * @property {string} original    الحرف كما كُتب
 * @property {string} normalized  الحرف بعد التطبيع
 * @property {number} value       القيمة المحسوبة لهذا الحرف (كبير أو صغير بحسب الدالة)
 * @property {import('../data/letters').HurufLetter | undefined} letter  سجل الحرف الكامل من الجدول
 */

/**
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions & { valueScheme?: 'mashriqi'|'maghribi' }} options
 * @param {'kabir'|'saghir'} valueKey
 */
function computeJummal(text, options, valueKey) {
  const { valueScheme = 'mashriqi', ...normalizeOptions } = options;
  const { letters } = normalizeText(text, normalizeOptions);
  let total = 0;
  const trace = letters.map((l) => {
    const letter = letterByChar(l.normalized);
    let value;
    if (valueScheme === 'maghribi') {
      const maghribiKabir = ABJAD_MAGHRIBI_VALUES[l.normalized] ?? 0;
      value = valueKey === 'saghir' ? reduceMod9(maghribiKabir) : maghribiKabir;
    } else {
      value = letter ? letter[valueKey] : 0;
    }
    total += value;
    return { original: l.original, normalized: l.normalized, value, letter };
  });
  return { total, trace };
}

/**
 * حساب الجمل الكبير (مشرقي افتراضيًا، أو مغربي حسب valueScheme) لنص عربي.
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions & { valueScheme?: 'mashriqi'|'maghribi' }} [options]
 * @returns {{ total: number, trace: LetterTrace[] }}
 */
export function jummalKabir(text, options = {}) {
  return computeJummal(text, options, 'kabir');
}

/**
 * حساب الجمل الصغير (كل حرف مختزل مسبقًا بالباقي على ٩، صفر ← ٩).
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions & { valueScheme?: 'mashriqi'|'maghribi' }} [options]
 * @returns {{ total: number, trace: LetterTrace[] }}
 */
export function jummalSaghir(text, options = {}) {
  return computeJummal(text, options, 'saghir');
}

export default jummalKabir;
