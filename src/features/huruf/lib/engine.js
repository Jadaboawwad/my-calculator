// المحرك الموحد — «موحّد الاختزال» (SPEC v2 §3)
// دالة اختزال واحدة reduce() تعمل بنفس المنطق على ثلاثة مقاييس: كلمة، نص، زمن.
// المدخل يتغير، الشبكة والمحرك لا يتغيران: نفس isqat() ونفس dawrOf() حرفيًا للحالات الثلاث.

import { isqat } from './isqat';
import { computeProfile } from './profile';
import { decodeChronogram, gregorianToHijri } from './chronogram';
import { dawrOf, nextAlignment } from './dawr';
import { numberToLetters } from './istintaq';
import { NATURE_LABELS } from '../data/letters';
import { PLANET_LABELS } from '../data/schemes';

/** المرجع القانوني: الياء = ١٠ — «لا فتح إلا بهذا المفتاح» (R17/R18) */
export const CANONICAL_MODULUS = 10;

/** البرج السابع — «الدور يدور إلى الميزان فيعتدل» (R33) */
export const LIBRA_BURJ_INDEX = 7;

/** التنويه المرافق لكل قراءة (SPEC §6) */
export const READING_DISCLAIMER =
  'قراءة وصفية تعليمية حسب منطق النظام التراثي — ليست تنبؤًا ولا حكمًا.';

export const SCALES = [
  { id: 'word', label: 'كلمة', icon: '🔤' },
  { id: 'text', label: 'نص/آية', icon: '📜' },
  { id: 'time', label: 'زمن', icon: '📅' },
];

/**
 * @typedef {'word'|'text'|'time'} Scale
 *
 * @typedef {Object} ReductionOptions
 * @property {import('./normalize').NormalizeOptions} [normalizeOptions]
 * @property {'mashriqi'|'maghribi'} [valueScheme]
 * @property {string} [planetSchemeId]
 * @property {1|2|3} [depth]                        مراتب الفتح الثلاث (R19)
 * @property {'beginner'|'advanced'} [disclosureLevel] يغيّر القراءة لا الرقم (R26)
 * @property {number|null} [targetNumber]           لمقياس النص: بحث subset-sum (R22)
 * @property {'hijri'|'gregorian'} [calendar]       لمقياس الزمن، الافتراضي hijri
 *
 * @typedef {Object} ReductionInput
 * @property {Scale} scale
 * @property {string|number} raw    كلمة، أو نص/آية، أو سنة (رقمية)
 * @property {ReductionOptions} [options]
 *
 * @typedef {Object} ReductionResult
 * @property {Scale} scale
 * @property {number} total              الجُمَّل الكبير (أو السنة لمقياس الزمن)
 * @property {number|null} saghir
 * @property {number} canonicalNumber    بعد الإسقاط النهائي (mod 10 → الياء)
 * @property {import('./jummal').LetterTrace[]} letterTrace  فارغ لمقياس الزمن
 * @property {{rank: number, nature: string, planet: string, burj: object}} lattice
 * @property {{isqat9: number, isqat12: number, isqat28: number, isqat7: number, isqat4: number}} projections
 * @property {1|2|3} depth
 * @property {number} cyclesCompleted    كم مرة "أُبدل الفرد" عند تجاوز العشرة (R24)
 * @property {string} reading            القراءة النصية المركبة حسب depth/disclosureLevel
 * @property {string[]} sourceTrace      معرّفات القواعد المستخدمة (R32)
 * @property {object} detail             تفاصيل خاصة بالمقياس (profile/chronogram/dawr…)
 */

/** خيارات الجُمَّل الموحدة: تطبيع + مخطط قيم */
function jummalOptions(options = {}) {
  const { normalizeOptions = {}, valueScheme } = options;
  return valueScheme ? { ...normalizeOptions, valueScheme } : { ...normalizeOptions };
}

function guardArabicInput(raw, profile, scaleLabel) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(`المدخل (${scaleLabel}) فارغ — «شرعة مخصوصة»: أدخل نصًا عربيًا أولًا`);
  }
  if (!profile.letterTrace.some((t) => t.letter)) {
    throw new Error(`المدخل (${scaleLabel}) لا يحوي حروفًا عربية صالحة للحساب`);
  }
}

function reduceWord(raw, options) {
  const profile = computeProfile(raw, {
    normalizeOptions: jummalOptions(options),
    planetSchemeId: options.planetSchemeId,
  });
  guardArabicInput(raw, profile, 'كلمة');
  return {
    total: profile.kabir,
    letterTrace: profile.letterTrace,
    profile,
    detail: { profile },
    sourceTrace: ['R1', 'R13', 'R17', 'R18', 'R24', 'R30'],
  };
}

function reduceText(raw, options) {
  const profile = computeProfile(raw, {
    normalizeOptions: jummalOptions(options),
    planetSchemeId: options.planetSchemeId,
  });
  guardArabicInput(raw, profile, 'نص/آية');
  const chronogram = decodeChronogram(raw, options.targetNumber ?? null, jummalOptions(options));
  return {
    total: chronogram.total,
    letterTrace: profile.letterTrace,
    profile,
    detail: { profile, chronogram },
    sourceTrace: ['R1', 'R13', 'R17', 'R18', 'R22', 'R24', 'R30'],
  };
}

function reduceTime(raw, options) {
  const inputYear = Number(raw);
  if (!Number.isInteger(inputYear) || inputYear < 1 || inputYear > 3000) {
    throw new Error('المدخل (زمن) يجب أن يكون سنة صحيحة بين ١ و٣٠٠٠');
  }
  const calendar = options.calendar === 'gregorian' ? 'gregorian' : 'hijri';
  // التحويل الميلادي→هجري جدولي حسابي تقريبي (منتصف السنة تقريبًا)
  const year = calendar === 'gregorian' ? gregorianToHijri(inputYear, 7, 1).year : inputYear;
  return {
    total: year,
    letterTrace: [], // فارغ لمقياس الزمن (SPEC §3)
    profile: null,
    detail: {
      calendar,
      inputYear,
      hijriYear: year,
      approximateConversion: calendar === 'gregorian',
      nextLibraYear: nextAlignment(year, LIBRA_BURJ_INDEX),
      istintaq: numberToLetters(year),
    },
    sourceTrace: ['R1', 'R17', 'R18', 'R24', 'R33'],
  };
}

const SCALE_REDUCERS = { word: reduceWord, text: reduceText, time: reduceTime };

/**
 * المحرك الموحد — مدخل → عدد مرجعي ثابت → موقع على الشبكة → قراءة مركّبة (SPEC §2).
 * @param {ReductionInput} input
 * @returns {ReductionResult}
 */
export function reduce(input) {
  const { scale, raw, options = {} } = input || {};
  const reducer = SCALE_REDUCERS[scale];
  if (!reducer) {
    throw new Error("reduce: المقياس يجب أن يكون 'word' أو 'text' أو 'time'");
  }
  const depth = options.depth === 2 || options.depth === 3 ? options.depth : 1;
  const disclosureLevel = options.disclosureLevel === 'advanced' ? 'advanced' : 'beginner';

  const base = reducer(raw, options);
  const { total, letterTrace, profile, detail } = base;

  // ما يلي مشترك حرفيًا بين المقاييس الثلاثة — هذا هو جوهر «صورة الصورة» (R7)
  const canonicalNumber = isqat(total, CANONICAL_MODULUS);
  const dawr = dawrOf(total);
  const lattice = {
    rank: dawr.rank10,
    nature: profile?.dominantNature ?? dawr.burj.nature,
    planet: profile?.dominantPlanet ?? dawr.planet,
    burj: dawr.burj,
  };
  const projections = {
    isqat9: isqat(total, 9),
    isqat12: isqat(total, 12),
    isqat28: isqat(total, 28),
    isqat7: isqat(total, 7),
    isqat4: isqat(total, 4),
  };
  const cyclesCompleted = (total - canonicalNumber) / CANONICAL_MODULUS;

  const result = {
    scale,
    total,
    saghir: profile ? profile.saghir : null,
    canonicalNumber,
    letterTrace,
    lattice,
    projections,
    depth,
    cyclesCompleted,
    detail: { ...detail, dawr },
    sourceTrace: base.sourceTrace,
    reading: '',
  };
  result.reading = composeReading(result, { depth, disclosureLevel });
  return result;
}

const SCALE_LABELS = { word: 'الكلمة', text: 'النص', time: 'السنة' };

/**
 * القراءة المركّبة — العمق ومستوى الإفصاح يغيّران الصياغة فقط، لا أي رقم (R19/R26).
 * @param {ReductionResult} result
 * @param {{depth: 1|2|3, disclosureLevel: 'beginner'|'advanced'}} opts
 */
export function composeReading(result, { depth, disclosureLevel }) {
  const { scale, total, canonicalNumber, lattice, projections, cyclesCompleted, detail } = result;
  const canonicalLetter = numberToLetters(canonicalNumber).letters[0];
  const natureAr = NATURE_LABELS[lattice.nature]?.ar ?? lattice.nature;
  const planetAr = PLANET_LABELS[lattice.planet] ?? lattice.planet;

  const lines = [];
  lines.push(
    `${SCALE_LABELS[scale]} تختزل إلى العدد المرجعي ${canonicalNumber} (حرفه: ${canonicalLetter.name})، في المرتبة ${lattice.rank}.`
  );
  if (canonicalNumber === CANONICAL_MODULUS) {
    lines.push('بلغ تمام المراتب (الياء) — «الفرد يُبدَل عند الياء»: إغلاق دورة وولادة أخرى.');
  }

  if (depth >= 2) {
    const natureSource = result.letterTrace.length > 0 ? 'طبيعته الغالبة' : 'طبيعة برجه';
    lines.push(
      `${natureSource}: ${natureAr}، كوكبه: ${planetAr}، وبرجه: ${lattice.burj.name} (الإسقاط الاثنا عشري ${projections.isqat12}).`
    );
    if (scale === 'time' && detail.approximateConversion) {
      lines.push(`السنة الميلادية ${detail.inputYear} حُوّلت هجريًا (${detail.hijriYear} هـ) تحويلًا حسابيًا تقريبيًا.`);
    }
  }

  if (depth >= 3) {
    lines.push(
      `أتمّ ${cyclesCompleted} دورة كاملة على مفتاح الياء قبل استقراره على ${canonicalNumber}.`
    );
    if (scale === 'time') {
      lines.push(`أقرب سنة يقع فيها الدور على صورة الميزان: ${detail.nextLibraYear}.`);
    }
    if (scale === 'text' && detail.chronogram?.targetYear != null) {
      lines.push(
        detail.chronogram.matchingSubsets.length > 0
          ? `وُجدت ${detail.chronogram.matchingSubsets.length} تركيبة كلمات تساوي العدد المطلوب ${detail.chronogram.targetYear}.`
          : `لا تركيبة كلمات تساوي العدد المطلوب ${detail.chronogram.targetYear}.`
      );
    }
  }

  if (disclosureLevel === 'advanced') {
    lines.push(
      `سلسلة الحساب: المجموع ${total} ← إسقاط ١٠ ← ${canonicalNumber} | إسقاطات أخرى: ٩←${projections.isqat9}، ١٢←${projections.isqat12}، ٢٨←${projections.isqat28}، ٧←${projections.isqat7}، ٤←${projections.isqat4}.`
    );
  }

  lines.push(READING_DISCLAIMER);
  return lines.join(' ');
}

export default reduce;
