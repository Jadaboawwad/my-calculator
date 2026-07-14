// جلب نص المصحف كاملًا عبر QURAN API (AlQuran Cloud) وتخزينه محليًا —
// حتى لا تنحصر المطابقة في «الآيات الرقمية» المحفوظة، بل تشمل أي آية توافق
// النظام وقواعده (جُمَّل/إسقاط/استنطاق) عبر نفس المحرك الموحد.
// النص يُجلب مرة واحدة ويُخزَّن في localStorage؛ الحساب كله محلي بعد ذلك.

/** رواية النص: الرسم الإملائي المبسّط — الأقرب لما يكتبه المستخدم في حقل الإدخال */
export const QURAN_API_EDITION = 'quran-simple';
export const QURAN_API_URL = `https://api.alquran.cloud/v1/quran/${QURAN_API_EDITION}`;
export const QURAN_CORPUS_STORAGE_KEY = 'huruf.quranCorpus.v1';
export const QURAN_API_SOURCE_LABEL = `نص المصحف عبر AlQuran Cloud API (${QURAN_API_EDITION})`;
/** عدد آيات المصحف — للتحقق من سلامة الجلب قبل الاعتماد عليه */
export const EXPECTED_AYAH_COUNT = 6236;

/**
 * @typedef {Object} QuranAyah
 * @property {number} surahNumber
 * @property {string} surahName    الاسم العربي للسورة
 * @property {number} ayahNumber   رقم الآية داخل السورة
 * @property {string} text
 */

/**
 * يحوّل استجابة AlQuran Cloud (v1/quran/{edition}) إلى قائمة آيات مسطّحة.
 * @param {object} json
 * @returns {QuranAyah[]}
 */
export function parseQuranApiResponse(json) {
  const surahs = json?.data?.surahs;
  if (json?.code !== 200 || !Array.isArray(surahs)) {
    throw new Error('استجابة QURAN API غير صالحة — تعذر قراءة نص المصحف');
  }
  const ayahs = [];
  for (const surah of surahs) {
    for (const ayah of surah.ayahs || []) {
      ayahs.push({
        surahNumber: surah.number,
        surahName: cleanSurahName(surah.name),
        ayahNumber: ayah.numberInSurah,
        // بعض الآيات تبدأ بعلامة BOM من الـ API — تُحذف
        text: String(ayah.text || '').replace(/\uFEFF/g, '').trim(),
      });
    }
  }
  if (ayahs.length < EXPECTED_AYAH_COUNT) {
    throw new Error(`نص المصحف ناقص من الـ API (${ayahs.length} آية) — لن يُعتمد`);
  }
  return ayahs;
}

/** اسم السورة يأتي مشكولًا وبعلامات مصحفية وألف وصل — يُنظَّف للعرض: «سُورَةُ ٱلْفَاتِحَةِ» ← «الفاتحة» */
export function cleanSurahName(name) {
  return String(name || '')
    .normalize('NFC') // يضم المدّة المفككة (ا + ٓ) إلى «آ» قبل حذف العلامات
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0671/g, 'ا')
    .replace(/^سورة\s+/, '')
    .trim();
}

// —— تخزين مضغوط: أسماء السور مرة واحدة، والآيات ثلاثيات [سورة، رقم، نص] ——

function packCorpus(ayahs) {
  const surahNames = {};
  for (const a of ayahs) surahNames[a.surahNumber] = a.surahName;
  return {
    v: 1,
    edition: QURAN_API_EDITION,
    surahNames,
    ayahs: ayahs.map((a) => [a.surahNumber, a.ayahNumber, a.text]),
  };
}

function unpackCorpus(packed) {
  if (!packed || packed.v !== 1 || !Array.isArray(packed.ayahs)) return null;
  if (packed.ayahs.length < EXPECTED_AYAH_COUNT) return null;
  return packed.ayahs.map(([surahNumber, ayahNumber, text]) => ({
    surahNumber,
    surahName: packed.surahNames?.[surahNumber] ?? String(surahNumber),
    ayahNumber,
    text,
  }));
}

function defaultStorage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** @returns {QuranAyah[]|null} */
export function loadCachedCorpus(storage = defaultStorage()) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(QURAN_CORPUS_STORAGE_KEY);
    return raw ? unpackCorpus(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveCorpusToCache(ayahs, storage = defaultStorage()) {
  if (!storage) return;
  try {
    storage.setItem(QURAN_CORPUS_STORAGE_KEY, JSON.stringify(packCorpus(ayahs)));
  } catch {
    // المساحة ممتلئة أو وضع خاص — يبقى النص في الذاكرة لهذه الجلسة فقط
  }
}

let memoryCorpus = null;
let inflightFetch = null;

/**
 * يعيد نص المصحف كاملًا: من الذاكرة، ثم من التخزين المحلي، ثم من QURAN API.
 * الطلبات المتزامنة تتشارك نفس الجلب (لا تكرار).
 * @param {{ force?: boolean, fetchImpl?: typeof fetch, storage?: Storage|null }} [opts]
 * @returns {Promise<QuranAyah[]>}
 */
export async function loadQuranCorpus(opts = {}) {
  const { force = false, fetchImpl = fetch, storage = defaultStorage() } = opts;

  if (!force) {
    if (memoryCorpus) return memoryCorpus;
    const cached = loadCachedCorpus(storage);
    if (cached) {
      memoryCorpus = cached;
      return cached;
    }
  }

  if (!inflightFetch) {
    inflightFetch = (async () => {
      try {
        const response = await fetchImpl(QURAN_API_URL);
        if (!response.ok) {
          throw new Error(`تعذر جلب نص المصحف من QURAN API (HTTP ${response.status})`);
        }
        const ayahs = parseQuranApiResponse(await response.json());
        memoryCorpus = ayahs;
        saveCorpusToCache(ayahs, storage);
        return ayahs;
      } finally {
        inflightFetch = null;
      }
    })();
  }
  return inflightFetch;
}

/** للاختبارات فقط — تصفير الذاكرة المؤقتة */
export function resetQuranCorpusMemory() {
  memoryCorpus = null;
  inflightFetch = null;
}

export default loadQuranCorpus;
