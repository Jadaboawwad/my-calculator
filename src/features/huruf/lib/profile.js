// ملف الحروف (profile) — كل ما يتتبعه النظام عن كلمة أو عبارة، بنداء واحد.

import { jummalKabir, jummalSaghir } from './jummal';
import { isqat9, isqat12, isqat28, isqat7, isqat4 } from './isqat';
import { NATURE_ORDER } from '../data/letters';
import { PLANET_SCHEMES, DEFAULT_PLANET_SCHEME_ID, CHALDEAN_PLANETS, burjByIndex } from '../data/schemes';

/**
 * @typedef {Object} HurufProfile
 * @property {number} kabir
 * @property {number} saghir
 * @property {number} isqat9
 * @property {number} isqat12
 * @property {number} isqat28
 * @property {number} isqat7
 * @property {number} isqat4
 * @property {Record<import('../data/letters').Nature, number>} natureCounts
 * @property {import('../data/letters').Nature|null} dominantNature
 * @property {Record<string, number>} planetCounts
 * @property {string|null} dominantPlanet
 * @property {number[]} rankPath
 * @property {ReturnType<typeof burjByIndex>} burj
 * @property {import('./jummal').LetterTrace[]} letterTrace
 */

function pickDominant(counts) {
  let best = null;
  let bestCount = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

/**
 * يحسب كل ما يتتبعه النظام لكلمة أو عبارة عربية في نداء واحد.
 * @param {string} text
 * @param {{ normalizeOptions?: object, planetSchemeId?: string }} [options]
 * @returns {HurufProfile}
 */
export function computeProfile(text, options = {}) {
  const { normalizeOptions = {}, planetSchemeId = DEFAULT_PLANET_SCHEME_ID } = options;
  const scheme = PLANET_SCHEMES[planetSchemeId] || PLANET_SCHEMES[DEFAULT_PLANET_SCHEME_ID];

  const kabirResult = jummalKabir(text, normalizeOptions);
  const saghirResult = jummalSaghir(text, normalizeOptions);
  const letterTrace = kabirResult.trace;

  const natureCounts = Object.fromEntries(NATURE_ORDER.map((n) => [n, 0]));
  const planetCounts = Object.fromEntries(CHALDEAN_PLANETS.map((p) => [p, 0]));
  const rankPath = [];

  for (const entry of letterTrace) {
    const letter = entry.letter;
    if (!letter) continue;
    natureCounts[letter.nature] += 1;
    planetCounts[scheme.assign(letter.abjadIndex)] += 1;
    rankPath.push(letter.rank);
  }

  const total = kabirResult.total;

  return {
    kabir: total,
    saghir: saghirResult.total,
    isqat9: isqat9(total),
    isqat12: isqat12(total),
    isqat28: isqat28(total),
    isqat7: isqat7(total),
    isqat4: isqat4(total),
    natureCounts,
    dominantNature: pickDominant(natureCounts),
    planetCounts,
    dominantPlanet: pickDominant(planetCounts),
    rankPath,
    burj: burjByIndex(isqat12(total)),
    letterTrace,
  };
}

export default computeProfile;
