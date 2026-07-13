// نقطة التصدير العامة لوحدة «نطاق الحروف» — علم الحروف

export { default as HurufModule } from './components/HurufModule';

export { computeProfile } from './lib/profile';
export { jummalKabir, jummalSaghir } from './lib/jummal';
export { isqat } from './lib/isqat';
export { numberToLetters, lettersToNumber, speakWord } from './lib/istintaq';
export { qalb, qalbPermutations, mazj, taksir, bast } from './lib/operations';
export { decodeChronogram, composeChronogram, hijriToGregorian, gregorianToHijri } from './lib/chronogram';
export { mizan } from './lib/mizan';
export { dawrOf, nextAlignment } from './lib/dawr';
export { verseOfTheDay } from './lib/verseOfDay';
export { HURUF_LETTERS } from './data/letters';
