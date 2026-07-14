import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseQuranApiResponse,
  cleanSurahName,
  loadCachedCorpus,
  saveCorpusToCache,
  loadQuranCorpus,
  resetQuranCorpusMemory,
  EXPECTED_AYAH_COUNT,
  QURAN_CORPUS_STORAGE_KEY,
} from '../quranApi';

/** استجابة API وهمية بعدد الآيات الكامل — سورة واحدة كبيرة تكفي للتحقق البنيوي */
function fakeApiJson(ayahCount = EXPECTED_AYAH_COUNT) {
  return {
    code: 200,
    data: {
      surahs: [
        {
          number: 1,
          name: 'سُورَةُ ٱلْفَاتِحَةِ',
          ayahs: Array.from({ length: ayahCount }, (_, i) => ({
            numberInSurah: i + 1,
            text: i === 0 ? '\uFEFFبسم الله الرحمن الرحيم' : `آية رقم ${i + 1}`,
          })),
        },
      ],
    },
  };
}

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    _map: map,
  };
}

beforeEach(() => resetQuranCorpusMemory());

describe('quranApi — جلب نص المصحف عبر QURAN API', () => {
  it('يفكك الاستجابة إلى آيات مسطحة ويحذف BOM وينظف اسم السورة', () => {
    const ayahs = parseQuranApiResponse(fakeApiJson());
    expect(ayahs).toHaveLength(EXPECTED_AYAH_COUNT);
    expect(ayahs[0]).toMatchObject({
      surahNumber: 1,
      surahName: 'الفاتحة',
      ayahNumber: 1,
      text: 'بسم الله الرحمن الرحيم',
    });
  });

  it('يرفض استجابة غير صالحة أو ناقصة الآيات', () => {
    expect(() => parseQuranApiResponse({ code: 500 })).toThrow();
    expect(() => parseQuranApiResponse(fakeApiJson(100))).toThrow(/ناقص/);
  });

  it('cleanSurahName: يزيل التشكيل والعلامات المصحفية وألف الوصل وبادئة «سورة»', () => {
    expect(cleanSurahName('سُورَةُ ٱلْبَقَرَةِ')).toBe('البقرة');
    // مدّة مفككة (ا + ٓ) كما تأتي من الـ API فعليًا — تُضم إلى «آ» ولا تُحذف
    expect(cleanSurahName('سُورَةُ ا\u0653لِ عِمۡرَانَ')).toBe('آل عمران');
    expect(cleanSurahName('سُورَةُ يسٓ')).toBe('يس');
  });

  it('التخزين المحلي: حفظ واسترجاع بلا فقد', () => {
    const storage = fakeStorage();
    const ayahs = parseQuranApiResponse(fakeApiJson());
    saveCorpusToCache(ayahs, storage);
    expect(storage._map.has(QURAN_CORPUS_STORAGE_KEY)).toBe(true);
    expect(loadCachedCorpus(storage)).toEqual(ayahs);
  });

  it('loadQuranCorpus: يجلب مرة واحدة ثم يخدم من الذاكرة/التخزين', async () => {
    const storage = fakeStorage();
    let fetchCalls = 0;
    const fetchImpl = async () => {
      fetchCalls += 1;
      return { ok: true, json: async () => fakeApiJson() };
    };

    const [a, b] = await Promise.all([
      loadQuranCorpus({ fetchImpl, storage }),
      loadQuranCorpus({ fetchImpl, storage }),
    ]);
    expect(fetchCalls).toBe(1); // الطلبات المتزامنة تتشارك نفس الجلب
    expect(a).toHaveLength(EXPECTED_AYAH_COUNT);
    expect(b).toBe(a);

    resetQuranCorpusMemory();
    const c = await loadQuranCorpus({ fetchImpl, storage });
    expect(fetchCalls).toBe(1); // من التخزين المحلي، لا جلب جديد
    expect(c).toHaveLength(EXPECTED_AYAH_COUNT);
  });

  it('loadQuranCorpus: خطأ HTTP يُبلَّغ برسالة عربية واضحة', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503 });
    await expect(loadQuranCorpus({ fetchImpl, storage: null })).rejects.toThrow(/503/);
  });
});
