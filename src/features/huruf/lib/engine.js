// محرك الاختزال الموحّد — نفس المنطق على ثلاث مقاييس: كلمة، نص، زمن

import { computeProfile } from './profile';
import { isqat, isqat9 } from './isqat';
import { dawrOf, nextAlignment } from './dawr';
import { decodeChronogram } from './chronogram';
import { NATURE_LABELS } from '../data/letters';
import { PLANET_LABELS } from '../data/schemes';
import { ruleById } from '../data/rules';

/** الياء=١٠ — المفتاح الافتراضي لكل الاختزالات (البيت #18) */
export const CANONICAL_MODULUS = 10;

/** @typedef {'word'|'text'|'time'} Scale */
/** @typedef {'beginner'|'advanced'} DisclosureLevel */

/**
 * @typedef {Object} ReductionInput
 * @property {Scale} scale
 * @property {string|number} raw
 * @property {import('./normalize').NormalizeOptions} [options]
 */

/**
 * @typedef {Object} ReductionResult
 * @property {Scale} scale
 * @property {number} rawTotal
 * @property {number} canonicalNumber
 * @property {import('./jummal').LetterTrace[]} letterTrace
 * @property {{ rank: number, nature: import('../data/letters').Nature|null, planet: string, burj: import('../data/schemes').Burj|null }} lattice
 * @property {1|2|3} depth
 * @property {number} cyclesCompleted
 * @property {string} reading
 * @property {string[]} sourceTrace
 * @property {{ steps: { label: string, value: number }[], isqat9: number, isqat12: number, isqat7: number, dominantNature: string|null, nextLibraYear?: number }} trace
 * @property {import('./chronogram').ChronogramDecode|null} [chronogram]
 */

/**
 * @param {Scale} scale
 * @param {string|number} raw
 */
export function validateReductionInput(scale, raw) {
  if (!['word', 'text', 'time'].includes(scale)) {
    throw new Error('scale يجب أن يكون word أو text أو time');
  }
  if (scale === 'time') {
    const year = Number(raw);
    if (!Number.isFinite(year) || year < 1 || year > 99999) {
      throw new Error('مقياس الزمن يتطلب سنة صالحة (١–٩٩٩٩٩)');
    }
    return;
  }
  const text = String(raw).trim();
  if (!text) throw new Error('المدخل فارغ — «ربّ اشرح لي صدري» يحتاج نداءً صالحًا');
  if (scale === 'word') {
    if (/\s/.test(text)) throw new Error('مقياس الكلمة يتطلب اسمًا واحدًا بلا مسافات');
    if (!/[\u0600-\u06FF]/.test(text)) throw new Error('المدخل يجب أن يحتوي حروفًا عربية');
  }
  if (scale === 'text' && text.length < 2) {
    throw new Error('مقياس النص يتطلب آية أو بيتًا (حرفان على الأقل)');
  }
}

function applyDepth(n, depth, modulus) {
  let result = n;
  for (let d = 1; d < depth; d++) {
    result = isqat(result, modulus);
  }
  return result;
}

function countCycles(n, modulus) {
  if (n <= 0) return 0;
  return Math.floor((n - 1) / modulus);
}

/**
 * @param {ReductionResult} partial
 * @param {DisclosureLevel} disclosureLevel
 */
function buildReading(partial, disclosureLevel) {
  const { scale, canonicalNumber, lattice, depth, cyclesCompleted } = partial;
  const natureLabel = lattice.nature ? NATURE_LABELS[lattice.nature].ar : '—';
  const planetLabel = PLANET_LABELS[lattice.planet] || lattice.planet;
  const burjName = lattice.burj?.name || '—';

  if (disclosureLevel === 'beginner') {
    return `حسب المنظومة: الرقم المرجعي ${canonicalNumber} — المرتبة ${lattice.rank}، الطبيعة ${natureLabel}، البرج ${burjName}.`;
  }

  const scaleLabel = { word: 'كلمة', text: 'نص/آية', time: 'زمن' }[scale];
  return (
    `حسب المنظومة (${scaleLabel}، عمق ${depth}): الرقم المرجعي ${canonicalNumber} (الياء=${CANONICAL_MODULUS}) — ` +
    `المرتبة ${lattice.rank}، الطبيعة ${natureLabel}، الكوكب ${planetLabel}، البرج ${burjName}. ` +
    `دورات مكتملة عند الياء: ${cyclesCompleted}.`
  );
}

/**
 * @param {ReductionInput} input
 * @param {{ depth?: 1|2|3, disclosureLevel?: DisclosureLevel, modulus?: number, planetSchemeId?: string, normalizeOptions?: object }} [engineOptions]
 * @returns {ReductionResult}
 */
export function reduce(input, engineOptions = {}) {
  const { scale, raw, options: inputOptions = {} } = input;
  const depth = engineOptions.depth || 1;
  const disclosureLevel = engineOptions.disclosureLevel || 'beginner';
  const modulus = engineOptions.modulus || CANONICAL_MODULUS;
  const planetSchemeId = engineOptions.planetSchemeId;
  const normalizeOptions = { ...inputOptions, ...engineOptions.normalizeOptions };

  validateReductionInput(scale, raw);

  const sourceTrace = ['rule-1', 'rule-18', 'rule-21'];
  let rawTotal = 0;
  let letterTrace = [];
  let profile = null;
  let chronogram = null;
  let nextLibraYear;

  if (scale === 'word') {
    sourceTrace.push('rule-13', 'rule-7');
    profile = computeProfile(String(raw), { normalizeOptions, planetSchemeId });
    rawTotal = profile.kabir;
    letterTrace = profile.letterTrace;
  } else if (scale === 'text') {
    sourceTrace.push('rule-22', 'rule-7', 'rule-13');
    const text = String(raw);
    chronogram = decodeChronogram(text, null, normalizeOptions);
    rawTotal = chronogram.total;
    profile = computeProfile(text, { normalizeOptions, planetSchemeId });
    letterTrace = profile.letterTrace;
  } else {
    sourceTrace.push('rule-33', 'rule-24', 'rule-7');
    rawTotal = Number(raw);
    const dawr = dawrOf(rawTotal);
    profile = {
      kabir: rawTotal,
      isqat9: isqat9(rawTotal),
      isqat12: dawr.burjIndex,
      isqat7: dawr.planetIndex,
      dominantNature: dawr.burj?.nature || null,
      dominantPlanet: dawr.planet,
      burj: dawr.burj,
    };
    nextLibraYear = nextAlignment(rawTotal, 7);
  }

  if (depth > 1) sourceTrace.push('rule-19');

  const canonicalNumber = applyDepth(isqat(rawTotal, modulus), depth, modulus);
  const cyclesCompleted = countCycles(rawTotal, modulus);
  const dawr = dawrOf(canonicalNumber);

  const lattice = {
    rank: dawr.rank10,
    nature: profile?.dominantNature || dawr.burj?.nature || null,
    planet: dawr.planet,
    burj: dawr.burj,
  };

  const traceSteps = [
    { label: 'المجموع الخام', value: rawTotal },
    { label: `إسقاط ${modulus} (الياء)`, value: isqat(rawTotal, modulus) },
  ];
  if (depth > 1) {
    traceSteps.push({ label: `عمق ${depth} (مراتب الفتح)`, value: canonicalNumber });
  }
  if (profile) {
    traceSteps.push(
      { label: 'إسقاط ٩ (الطاء)', value: profile.isqat9 ?? isqat9(rawTotal) },
      { label: 'إسقاط ١٢ (البرج)', value: profile.isqat12 ?? dawr.burjIndex },
      { label: 'إسقاط ٧ (الكوكب)', value: profile.isqat7 ?? dawr.planetIndex }
    );
  }

  const result = {
    scale,
    rawTotal,
    canonicalNumber,
    letterTrace,
    lattice,
    depth,
    cyclesCompleted,
    reading: '',
    sourceTrace: [...new Set([...sourceTrace, 'rule-32', 'rule-30', 'rule-14'])],
    trace: {
      steps: traceSteps,
      isqat9: profile?.isqat9 ?? isqat9(rawTotal),
      isqat12: profile?.isqat12 ?? dawr.burjIndex,
      isqat7: profile?.isqat7 ?? dawr.planetIndex,
      dominantNature: lattice.nature,
      nextLibraYear: scale === 'time' ? nextLibraYear : undefined,
    },
    chronogram,
  };

  result.reading = buildReading(result, disclosureLevel);
  return result;
}

/**
 * يجمع كل الأبعاد في تقرير واحد (البيت #8، #30).
 * @param {string} text
 * @param {object} [options]
 */
export function profile(text, options = {}) {
  const hurufProfile = computeProfile(text, options);
  const reduction = reduce({ scale: 'word', raw: text, options: options.normalizeOptions }, options);
  return {
    ...hurufProfile,
    reduction,
    reading: reduction.reading,
    mizan: {
      isqat9: hurufProfile.isqat9,
      nature: hurufProfile.dominantNature,
      burj: hurufProfile.burj?.name,
    },
  };
}

/** يُفعّل البذرة (البيت #2) — اختزال الكمون إلى فعل */
export function activate(seed, options = {}) {
  return reduce({ scale: 'word', raw: String(seed) }, { depth: 2, ...options });
}

export function sourceRulesForTrace(sourceTrace) {
  return sourceTrace.map((id) => ruleById(id)).filter(Boolean);
}

export default reduce;
