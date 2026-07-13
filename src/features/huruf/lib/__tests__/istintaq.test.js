import { describe, it, expect } from 'vitest';
import { numberToLetters, lettersToNumber, speakWord } from '../istintaq';

describe('numberToLetters', () => {
  it('1394 -> غ ش ص د (1000+300+90+4)', () => {
    const { letters, text } = numberToLetters(1394);
    expect(letters.map((l) => l.char)).toEqual(['غ', 'ش', 'ص', 'د']);
    expect(text).toBe('غشصد');
  });

  it('round-trips through lettersToNumber', () => {
    const { text } = numberToLetters(1394);
    expect(lettersToNumber(text)).toBe(1394);
  });

  it('skips zero digits', () => {
    const { letters } = numberToLetters(1004);
    expect(letters.map((l) => l.char)).toEqual(['غ', 'د']);
  });
});

describe('speakWord', () => {
  it('is explicitly labeled experimental', () => {
    const result = speakWord(14);
    expect(result.experimental).toBe(true);
    expect(Array.isArray(result.allOrderings)).toBe(true);
  });
});
