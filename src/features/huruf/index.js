// نقطة التصدير العامة لوحدة «نطاق الحروف» — علم الحروف (SPEC v2: موحّد الاختزال)

export { default as HurufModule } from './components/HurufModule';

export { computeProfile } from './lib/profile';
export { reduce, profile, activate, CANONICAL_MODULUS, sourceRulesForTrace } from './lib/engine';
export { predictVerseNumber, fetchVerseText, predictVerseWithReduction } from './lib/predictedVerse';
export { jummalKabir, jummalSaghir } from './lib/jummal';
export { isqat } from './lib/isqat';
export { numberToLetters, lettersToNumber, speakWord } from './lib/istintaq';
export { qalb, qalbPermutations, mazj, taksir, bast } from './lib/operations';
export { decodeChronogram, composeChronogram, hijriToGregorian, gregorianToHijri } from './lib/chronogram';
export { mizan } from './lib/mizan';
export { dawrOf, nextAlignment } from './lib/dawr';
export { verseOfTheDay, nearestAvailableNumber } from './lib/verseOfDay';
export { calculateHurufVerseNumber } from './lib/verseFromHuruf';
export { HURUF_LETTERS, NATURE_LABELS } from './data/letters';
export { PLANET_LABELS } from './data/schemes';
export { versesForNumber } from './data/quranNumbers';
export { EXTRACTED_RULES, ruleById } from './data/rules';
export { DATA_SOURCES, FRAMEWORK_DISCLAIMER } from './data/sources';
export { MUQATTAAT_SEED, getAllQuranNumericEntries, addUserQuranEntry } from './data/quran-numeric';
