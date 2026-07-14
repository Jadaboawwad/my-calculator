import { describe, it, expect } from 'vitest';
import { loadUserEntries, addUserEntry, removeUserEntry, USER_VERSES_STORAGE_KEY } from '../userVerses';
import { isDocumented } from '../../data/quranNumeric';

function fakeStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
}

describe('userVerses — مخزن إضافات المستخدم', () => {
  it('إضافة ثم تحميل ثم حذف (roundtrip)', () => {
    const storage = fakeStorage();
    const entry = addUserEntry(
      { surah: 'الفجر', ayahNumber: 2, textExcerpt: 'وليال عشر', numericValue: 10, source: 'تفسير الطبري' },
      storage
    );
    expect(entry.category).toBe('user_curated');
    expect(entry.id).toMatch(/^user-/);

    const loaded = loadUserEntries(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].numericValue).toBe(10);

    removeUserEntry(entry.id, storage);
    expect(loadUserEntries(storage)).toHaveLength(0);
  });

  it('الإدخال بلا مصدر يُخزَّن لكنه غير موثّق', () => {
    const storage = fakeStorage();
    const entry = addUserEntry({ surah: 'الكهف', ayahNumber: 25, textExcerpt: 'ثلاث مائة سنين وازدادوا تسعا' }, storage);
    expect(loadUserEntries(storage)).toHaveLength(1);
    expect(isDocumented(entry)).toBe(false);
  });

  it('يرفض الإدخال الناقص أو الفاسد', () => {
    const storage = fakeStorage();
    expect(() => addUserEntry({ surah: '', ayahNumber: 1, textExcerpt: 'نص' }, storage)).toThrow();
    expect(() => addUserEntry({ surah: 'س', ayahNumber: 0, textExcerpt: 'نص' }, storage)).toThrow();
    expect(() => addUserEntry({ surah: 'س', ayahNumber: 1, textExcerpt: '' }, storage)).toThrow();
    expect(() => addUserEntry({ surah: 'س', ayahNumber: 1, textExcerpt: 'نص', numericValue: -5 }, storage)).toThrow();
  });

  it('يتحمّل مخزنًا فاسد المحتوى', () => {
    const storage = fakeStorage();
    storage.setItem(USER_VERSES_STORAGE_KEY, '{ليس json صالحًا');
    expect(loadUserEntries(storage)).toEqual([]);
  });
});
