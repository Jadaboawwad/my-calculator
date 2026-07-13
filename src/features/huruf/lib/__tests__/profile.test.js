import { describe, it, expect } from 'vitest';
import { computeProfile } from '../profile';

describe('computeProfile', () => {
  it('aggregates kabir/saghir/isqat/nature/planet/rank/burj for a word', () => {
    const profile = computeProfile('محمد');
    expect(profile.kabir).toBe(92);
    expect(profile.letterTrace).toHaveLength(4);
    expect(profile.rankPath).toHaveLength(4);
    expect(Object.values(profile.natureCounts).reduce((a, b) => a + b, 0)).toBe(4);
    expect(Object.values(profile.planetCounts).reduce((a, b) => a + b, 0)).toBe(4);
    expect(profile.dominantNature).not.toBeNull();
    expect(profile.burj).toBeTruthy();
  });
});
