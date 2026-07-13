// الاستنطاق — جعل الأرقام "تنطق" حروفًا، والحروف تُرجع أرقامًا.

import { letterByKabir } from '../data/letters';
import { jummalKabir } from './jummal';

/**
 * يفكّك عددًا صحيحًا موجبًا إلى حروف أبجدية حسب القيمة المكانية (آحاد/عشرات/مئات/ألوف)،
 * بالطريقة الجشعة الأكبر-أولًا (greedy-largest). هذا التفكيك وحيد القيمة (فريد) لأن مجموعة
 * قيم الجُمَّل تطابق تمامًا منازل النظام العشري (١..٩، ١٠..٩٠، ١٠٠..٩٠٠، ١٠٠٠) — فلا تعدد فيه
 * إلا في الألوف التي تتكرر بحرف الغين لكل ألف كامل.
 * @param {number} n
 * @returns {{ letters: import('../data/letters').HurufLetter[], text: string }}
 */
export function numberToLetters(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('numberToLetters: expects a positive integer');
  }
  const letters = [];
  let remaining = n;

  const thousands = Math.floor(remaining / 1000);
  for (let i = 0; i < thousands; i++) letters.push(letterByKabir(1000));
  remaining -= thousands * 1000;

  const hundreds = Math.floor(remaining / 100) * 100;
  if (hundreds > 0) letters.push(letterByKabir(hundreds));
  remaining -= hundreds;

  const tens = Math.floor(remaining / 10) * 10;
  if (tens > 0) letters.push(letterByKabir(tens));
  remaining -= tens;

  if (remaining > 0) letters.push(letterByKabir(remaining));

  return { letters, text: letters.map((l) => l.char).join('') };
}

/**
 * استنطاق كل مكوّن عددي على حدة ثم دمجه — يتجنّب تكرار مئات حروف الألف
 * عند تفكيك أعداد مركّبة كبيرة (مثل ١٧٣٠٠٠ كوقت HHMMSS).
 * @param  {...number} values
 * @returns {{ parts: string[], text: string, lettersText: string }}
 */
export function compoundIstintaq(...values) {
  const parts = values
    .filter((v) => Number.isInteger(v) && v > 0)
    .map((v) => numberToLetters(v).text);
  return {
    parts,
    text: parts.join(' · '),
    lettersText: parts.join(''),
  };
}

/**
 * القيمة العددية لنص عربي — مرادف لحساب الجمل الكبير.
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions} [options]
 * @returns {number}
 */
export function lettersToNumber(text, options = {}) {
  return jummalKabir(text, options).total;
}

// معجم بذرة صغير جدًا لتجربة "النطق" — ليس معجمًا شاملًا، وإنما توضيحي فقط.
const SEED_WORDLIST = new Set([
  'غد', 'دم', 'مد', 'قد', 'ضد', 'رد', 'شد', 'جد', 'حد', 'سد', 'ود', 'يد',
  'باد', 'داب', 'صبر', 'ربص', 'قصد', 'صدق',
]);

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) result.push([arr[i], ...p]);
  }
  return result;
}

/**
 * محاولة (تجريبية) لترتيب حروف تفكيك عدد في صيغ قابلة للنطق، بمطابقة معجم بذرة صغير جدًا.
 * تُعرض النتيجة دومًا بوصفها "تجريبي" — ليست أداة توليد أسماء أو تكهنات.
 * @param {number} n
 * @param {{ maxPermutations?: number }} [opts]
 * @returns {{ experimental: true, allOrderings: string[], dictionaryMatches: string[] }}
 */
export function speakWord(n, opts = {}) {
  const { maxPermutations = 24 } = opts;
  const { letters } = numberToLetters(n);
  const chars = letters.map((l) => l.char);
  const allPerms = permutations(chars).slice(0, maxPermutations);
  const allOrderings = allPerms.map((p) => p.join(''));
  const dictionaryMatches = allOrderings.filter((w) => SEED_WORDLIST.has(w));
  return { experimental: true, allOrderings, dictionaryMatches };
}

export default numberToLetters;
