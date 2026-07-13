// تطبيع النص العربي — قواعد صريحة وقابلة للتبديل، لا افتراضات صامتة.
// كل حرف ناتج يحمل أثرًا (trace) يربطه بحرفه الأصلي لضمان إمكانية التحقق اليدوي.

/**
 * @typedef {Object} NormalizeOptions
 * @property {boolean} hamzaAsAlif      أ إ آ ء ؤ ئ → ا  (افتراضي true)
 * @property {boolean} hamzaWawAsWaw    ؤ → و بدل ا (افتراضي false)
 * @property {boolean} hamzaYaAsYa      ئ → ي بدل ا (افتراضي false)
 * @property {'ha'|'ta'} taMarbutaAs    ة → ه (افتراضي) أو ت
 * @property {'ya'|'alif'} alifMaqsuraAs ى → ي (افتراضي) أو ا
 * @property {boolean} countShadda      هل تُحسب الشدة حرفين؟ (افتراضي false — يُحسب المكتوب لا الملفوظ)
 */

export const DEFAULT_NORMALIZE_OPTIONS = {
  hamzaAsAlif: true,
  hamzaWawAsWaw: false,
  hamzaYaAsYa: false,
  taMarbutaAs: 'ha',
  alifMaqsuraAs: 'ya',
  countShadda: false,
};

const SHADDA = 'ّ';
// تطويل + جميع علامات التشكيل القياسية (تُحذف دومًا قبل الحساب، عدا الشدة التي تُعالَج أولًا)
const OTHER_DIACRITICS_RE = /[ًٌٍَُِْٰـ]/g;

// روابط لا الشائعة (ligatures) — تُفكّ دومًا إلى ل + ا
const LAM_ALIF_LIGATURES = new Set(['ﻵ', 'ﻶ', 'ﻷ', 'ﻸ', 'ﻹ', 'ﻺ', 'ﻻ', 'ﻼ']);

const HAMZA_FORMS = new Set(['أ', 'إ', 'آ', 'ء', 'ؤ', 'ئ']);

function mapSpecialChar(ch, opts) {
  if (ch === 'ة') return opts.taMarbutaAs === 'ta' ? 'ت' : 'ه';
  if (ch === 'ى') return opts.alifMaqsuraAs === 'alif' ? 'ا' : 'ي';
  if (ch === 'ؤ' && opts.hamzaWawAsWaw) return 'و';
  if (ch === 'ئ' && opts.hamzaYaAsYa) return 'ي';
  if (HAMZA_FORMS.has(ch)) return opts.hamzaAsAlif ? 'ا' : null;
  return ch;
}

const ARABIC_LETTER_RE = /[ء-ي]/;

/**
 * يحوّل نصًا عربيًا إلى سلسلة حروف "مطبّعة" جاهزة للحساب، مع أثر لكل حرف.
 * @param {string} text
 * @param {Partial<NormalizeOptions>} options
 * @returns {{ letters: {original: string, normalized: string, sourceIndex: number}[], normalized: string }}
 */
export function normalizeText(text, options = {}) {
  const opts = { ...DEFAULT_NORMALIZE_OPTIONS, ...options };
  const withoutOtherDiacritics = text.replace(OTHER_DIACRITICS_RE, '');

  const letters = [];

  for (let i = 0; i < withoutOtherDiacritics.length; i++) {
    const ch = withoutOtherDiacritics[i];

    if (ch === SHADDA) {
      if (opts.countShadda && letters.length > 0) {
        const prev = letters[letters.length - 1];
        letters.push({ original: prev.original, normalized: prev.normalized, sourceIndex: i });
      }
      continue;
    }

    if (LAM_ALIF_LIGATURES.has(ch)) {
      letters.push({ original: ch, normalized: 'ل', sourceIndex: i });
      letters.push({ original: ch, normalized: 'ا', sourceIndex: i });
      continue;
    }

    if (!ARABIC_LETTER_RE.test(ch)) {
      continue; // مسافات، أرقام، علامات ترقيم — لا تدخل في الحساب
    }

    const mapped = mapSpecialChar(ch, opts);
    if (mapped) {
      letters.push({ original: ch, normalized: mapped, sourceIndex: i });
    }
  }

  return {
    letters,
    normalized: letters.map((l) => l.normalized).join(''),
  };
}

export default normalizeText;
