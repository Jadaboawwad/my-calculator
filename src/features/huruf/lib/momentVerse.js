// اختزال اللحظة الحالية — يبني مدخل المحرك الموحد من استنطاق التاريخ الهجري والوقت
// (والرقم المختار إن وجد)، ثم يمرره عبر نفس reduce({scale:'text'}): استنطاق (R2/R13)
// ثم جُمَّل وإسقاطات — لا صيغة مخصوصة خارج المحرك.

import { reduce } from './engine';
import { compoundIstintaq, numberToLetters } from './istintaq';
import { gregorianToHijri } from './chronogram';

/**
 * يختزل اللحظة الحالية عبر المحرك الموحد.
 * @param {Date} [date]
 * @param {{ selectedNumber?: number|string|null, options?: import('./engine').ReductionOptions }} [params]
 * @returns {{
 *   result: import('./engine').ReductionResult,
 *   hijri: { year: number, month: number, day: number },
 *   parts: { date: string, time: string, number: string|null },
 * }}
 */
export function reduceMoment(date = new Date(), { selectedNumber = null, options = {} } = {}) {
  const hijri = gregorianToHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());

  const dateIstintaq = compoundIstintaq(hijri.year, hijri.month, hijri.day);
  const timeIstintaq = compoundIstintaq(date.getHours(), date.getMinutes());

  let numberText = null;
  const num = Number(selectedNumber);
  if (selectedNumber != null && selectedNumber !== '' && Number.isInteger(num) && num > 0) {
    numberText = numberToLetters(num).text;
  }

  const raw = [dateIstintaq.lettersText, timeIstintaq.lettersText, numberText]
    .filter(Boolean)
    .join(' ');

  return {
    result: reduce({ scale: 'text', raw, options }),
    hijri,
    parts: {
      date: dateIstintaq.text,
      time: timeIstintaq.text || null,
      number: numberText,
    },
  };
}

export default reduceMoment;
