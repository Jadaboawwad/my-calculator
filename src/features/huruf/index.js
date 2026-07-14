// نقطة التصدير العامة لوحدة «نطاق الحروف» — موحّد الاختزال

export { default as HurufModule } from './components/HurufModule';

// المحرك الموحد (SPEC v2)
export { reduce, CANONICAL_MODULUS, LIBRA_BURJ_INDEX, SCALES } from './lib/engine';
export { suggestVerses, MATCH_TYPE_LABELS } from './lib/verseSuggest';
export { loadUserEntries, addUserEntry, removeUserEntry } from './lib/userVerses';

// المكتبات الأساسية (يستعملها المحرك نفسه)
export { computeProfile } from './lib/profile';
export { jummalKabir, jummalSaghir } from './lib/jummal';
export { isqat } from './lib/isqat';
export { numberToLetters, lettersToNumber, speakWord } from './lib/istintaq';
export { qalb, qalbPermutations, mazj, taksir, bast } from './lib/operations';
export { decodeChronogram, composeChronogram, hijriToGregorian, gregorianToHijri } from './lib/chronogram';
export { mizan } from './lib/mizan';
export { dawrOf, nextAlignment } from './lib/dawr';
export { verseOfTheDay, nearestAvailableNumber } from './lib/verseOfDay';

// البيانات
export { RULES, ruleById, CANONICAL_RULE_IDS } from './data/rules';
export { SEED_ENTRIES, MUQATTAAT_ENTRIES, EXPLICIT_NUMBER_ENTRIES, isDocumented } from './data/quranNumeric';
export { MUQATTAAT_GROUPS, surahsWithOpener } from './data/muqattaat';
export { HURUF_LETTERS, NATURE_LABELS } from './data/letters';
export { PLANET_LABELS } from './data/schemes';
export { versesForNumber } from './data/quranNumbers';
