// العمليات الكلاسيكية: القلب، المزج، التكسير (صدر ومؤخر)، البسط.

import { normalizeText } from './normalize';
import { letterByChar } from '../data/letters';
import { jummalKabir } from './jummal';

/**
 * قلب — عكس ترتيب الحروف.
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions} [options]
 */
export function qalb(text, options = {}) {
  const { letters } = normalizeText(text, options);
  const reversed = [...letters].reverse().map((l) => l.normalized);
  return { text: reversed.join(''), letters: reversed };
}

function permute(chars, cap) {
  const results = [];
  function go(remaining, memo) {
    if (results.length >= cap) return;
    if (remaining.length === 0) {
      results.push(memo.join(''));
      return;
    }
    for (let i = 0; i < remaining.length && results.length < cap; i++) {
      go([...remaining.slice(0, i), ...remaining.slice(i + 1)], [...memo, remaining[i]]);
    }
  }
  go(chars, []);
  return results;
}

/**
 * كل ترتيبات (تباديل) حروف الكلمة — تُقتصر النتيجة على أول cap ترتيب لتفادي الانفجار التوافقي.
 * @param {string} text
 * @param {{ cap?: number }} [opts]
 */
export function qalbPermutations(text, opts = {}) {
  const { cap = 50 } = opts;
  const { letters } = normalizeText(text);
  return permute(letters.map((l) => l.normalized), cap);
}

/**
 * مزج — تشبيك حرفين حرفًا حرفًا؛ يُلحق الباقي إن اختلف الطولان.
 * مثال: مزج(ابج, دهو) = ادبهجو
 * @param {string} wordA
 * @param {string} wordB
 * @param {import('./normalize').NormalizeOptions} [options]
 */
export function mazj(wordA, wordB, options = {}) {
  const a = normalizeText(wordA, options).letters.map((l) => l.normalized);
  const b = normalizeText(wordB, options).letters.map((l) => l.normalized);
  const maxLen = Math.max(a.length, b.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return { text: result.join(''), letters: result };
}

// تدوير "من الخارج إلى الداخل": آخر ثم أول، ثم قبل الآخر ثم بعد الأول... (صدر ومؤخر)
function outsideInStep(letters) {
  const result = [];
  let i = 0;
  let j = letters.length - 1;
  while (i < j) {
    result.push(letters[j]);
    result.push(letters[i]);
    j -= 1;
    i += 1;
  }
  if (i === j) result.push(letters[i]); // الحرف الأوسط في الكلمات الفردية الطول
  return result;
}

/**
 * تكسير (صدر ومؤخر) — يولّد دائرة الكلمة: صفوف متتابعة بتدوير "آخر+أول" حتى تعود إلى الصف الأصلي.
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions} [options]
 * @returns {{ rows: string[] }}
 */
export function taksir(text, options = {}) {
  const { letters } = normalizeText(text, options);
  let current = letters.map((l) => l.normalized);
  const seed = current.join('');
  const rows = [seed];

  if (current.length <= 1) return { rows };

  let guard = 0;
  while (guard < 1000) {
    current = outsideInStep(current);
    const rowText = current.join('');
    rows.push(rowText);
    guard += 1;
    if (rowText === seed) break;
  }
  return { rows };
}

/**
 * بسط — يستبدل كل حرف باسمه المنطوق (ب ← باء) ثم يعيد حساب الجمل على الصيغة الممدودة.
 * @param {string} text
 * @param {import('./normalize').NormalizeOptions} [options]
 */
export function bast(text, options = {}) {
  const { letters } = normalizeText(text, options);
  const expandedText = letters
    .map((l) => letterByChar(l.normalized)?.name || l.normalized)
    .join('');
  const kabirResult = jummalKabir(expandedText, options);
  return { expandedText, ...kabirResult };
}

export default { qalb, qalbPermutations, mazj, taksir, bast };
