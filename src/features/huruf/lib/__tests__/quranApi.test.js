import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseQuranApiResponse,
  cleanSurahName,
  loadCachedCorpus,
  saveCorpusToCache,
  loadQuranCorpus,
  resetQuranCorpusMemory,
  fetchTafsir,
  resolveSurahNumber,
  EXPECTED_AYAH_COUNT,
  QURAN_CORPUS_STORAGE_KEY,
  TAFSIR_EDITION,
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

describe('quranApi — جلب تفسير الآية', () => {
  it('fetchTafsir: يقرأ نص التفسير واسم الطبعة', async () => {
    const fetchImpl = async (url) => {
      expect(url).toContain('/ayah/2:29/ar.muyassar');
      return {
        ok: true,
        json: async () => ({
          code: 200,
          data: {
            text: 'تفسير تجريبي للآية',
            numberInSurah: 29,
            edition: { identifier: TAFSIR_EDITION, name: 'تفسير المیسر' },
            surah: { number: 2 },
          },
        }),
      };
    };
    const t = await fetchTafsir(2, 29, { fetchImpl });
    expect(t.text).toBe('تفسير تجريبي للآية');
    expect(t.surahNumber).toBe(2);
    expect(t.ayahNumber).toBe(29);
    expect(t.edition).toBe(TAFSIR_EDITION);
  });

  it('fetchTafsir: يرفض أرقامًا غير صالحة', async () => {
    await expect(fetchTafsir(0, 1)).rejects.toThrow(/السورة/);
    await expect(fetchTafsir(2, 0)).rejects.toThrow(/الآية/);
  });

  it('resolveSurahNumber: من الحقل أو المعرّف أو اسم السورة في المصحف', () => {
    expect(resolveSurahNumber({ surahNumber: 2, ayahNumber: 29 })).toBe(2);
    expect(resolveSurahNumber({ id: 'quran-36-1', ayahNumber: 1 })).toBe(36);
    const corpus = [{ surahNumber: 2, surahName: 'البقرة', ayahNumber: 29, text: '…' }];
    expect(resolveSurahNumber({ surah: 'البقرة', ayahNumber: 29 }, corpus)).toBe(2);
    expect(resolveSurahNumber({ surah: 'سورة غير موجودة', ayahNumber: 1 }, corpus)).toBeNull();
  });
});
