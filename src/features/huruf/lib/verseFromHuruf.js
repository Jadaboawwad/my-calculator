// اختيار رقم الآية الكلي (١..٦٢٣٦) وفق منظومة نطاق الحروف — استنطاق + جُمَّل + إسقاطات

import { computeProfile } from './profile';
import { numberToLetters } from './istintaq';
import { isqat9, isqat12, isqat28, isqat7, isqat4 } from './isqat';

const TOTAL_VERSES = 6236;

function safeIstintaq(n) {
  if (!Number.isInteger(n) || n <= 0) return { text: '', letters: [] };
  return numberToLetters(n);
}

function safeProfile(text) {
  if (!text || !text.trim()) return null;
  try {
    return computeProfile(text);
  } catch {
    return null;
  }
}

function profileSeed(profile, weight = 1) {
  if (!profile) return 0;
  return (
    profile.kabir * weight +
    profile.isqat28 * 28 +
    profile.isqat12 * 12 +
    profile.isqat9 * 9 +
    profile.isqat7 * 7 +
    profile.isqat4 * 4
  );
}

function toVerseNumber(seed) {
  let verseNumber = Math.abs(Math.floor(seed)) % TOTAL_VERSES;
  if (verseNumber === 0) verseNumber = TOTAL_VERSES;
  return verseNumber;
}

/**
 * يحسب رقم الآية الكلي وفق نطاق الحروف: استنطاق التاريخ الهجري والوقت،
 * جُمَّل الحروف المستنطقة، وإسقاطات المراتب (٩) والمنازل (٢٨) والبروج (١٢) والكواكب (٧) والطبائع (٤).
 *
 * @param {object} params
 * @param {number} params.hours
 * @param {number} params.minutes
 * @param {number} params.seconds
 * @param {{ year?: number, month?: number, day?: number }|null} [params.gregorianDate]
 * @param {{ year?: number, month?: number, day?: number }|null} [params.hijriDate]
 * @param {number|string|null} [params.selectedNumber]
 * @param {object|null} [params.previousMarqumAnalysis]
 * @returns {{ verseNumber: number, hurufMeta: object }}
 */
export function calculateHurufVerseNumber({
  hours,
  minutes,
  seconds,
  gregorianDate = null,
  hijriDate = null,
  selectedNumber = null,
  previousMarqumAnalysis = null,
}) {
  const { year: hYear = 0, month: hMonth = 0, day: hDay = 0 } = hijriDate || {};
  const { year: gYear = 0, month: gMonth = 0, day: gDay = 0 } = gregorianDate || {};

  // استنطاق العام الهجري (مثل ١٣٩٤ ← غ ش ص د)
  const hijriYearIstintaq = safeIstintaq(hYear);
  const hijriDateNum = hYear > 0 ? hYear * 10000 + hMonth * 100 + hDay : 0;
  const hijriDateIstintaq = safeIstintaq(hijriDateNum);

  const gregorianDateNum = gYear > 0 ? gYear * 10000 + gMonth * 100 + gDay : 0;
  const gregorianDateIstintaq = safeIstintaq(gregorianDateNum);

  const timeComposite = hours * 10000 + minutes * 100 + seconds;
  const timeIstintaq = safeIstintaq(timeComposite);

  const hijriYearProfile = safeProfile(hijriYearIstintaq.text);
  const hijriDateProfile = safeProfile(hijriDateIstintaq.text);
  const gregorianDateProfile = safeProfile(gregorianDateIstintaq.text);
  const timeProfile = safeProfile(timeIstintaq.text);

  let seed = 0;
  seed += profileSeed(hijriYearProfile, 3);
  seed += profileSeed(hijriDateProfile, 2);
  seed += profileSeed(gregorianDateProfile);
  seed += profileSeed(timeProfile, 2);

  // إسقاط ٩ على مجموعات التاريخ والوقت
  if (hYear + hMonth + hDay > 0) {
    seed += isqat9(hYear + hMonth + hDay) * 100;
  }
  if (gYear + gMonth + gDay > 0) {
    seed += isqat9(gYear + gMonth + gDay) * 100;
  }
  seed += isqat9(hours + minutes + seconds) * 50;
  seed += isqat28(hours * 60 + minutes) * 28;

  // الرقم المختار — جُمَّل وإسقاطاته
  if (selectedNumber != null && selectedNumber !== '') {
    const num = Number(selectedNumber);
    if (Number.isFinite(num) && num > 0) {
      const numIstintaq = safeIstintaq(num);
      const numProfile = safeProfile(numIstintaq.text) || safeProfile(String(num));
      seed += profileSeed(numProfile, 2);
    }
  }

  // جُمَّل الآية السابقة (كتاب مرقوم)
  if (previousMarqumAnalysis?.verseAnalysis) {
    const va = previousMarqumAnalysis.verseAnalysis;
    if (va.totalJumal > 0) {
      seed += va.totalJumal;
      seed += isqat9(va.totalJumal) * va.reducedJumal;
      seed += isqat28(va.totalJumal) * 12;
    }
    if (va.totalSequential > 0) {
      seed += va.totalSequential;
      seed += isqat12(va.totalSequential) * 7;
    }
  }

  const verseNumber = toVerseNumber(seed);

  return {
    verseNumber,
    hurufMeta: {
      hijriYearIstintaq: hijriYearIstintaq.text || null,
      hijriDateIstintaq: hijriDateIstintaq.text || null,
      timeIstintaq: timeIstintaq.text || null,
      seed,
      profiles: {
        hijriYear: hijriYearProfile
          ? { kabir: hijriYearProfile.kabir, isqat9: hijriYearProfile.isqat9, isqat28: hijriYearProfile.isqat28 }
          : null,
        time: timeProfile
          ? { kabir: timeProfile.kabir, isqat9: timeProfile.isqat9, isqat28: timeProfile.isqat28 }
          : null,
      },
    },
  };
}

export default calculateHurufVerseNumber;
