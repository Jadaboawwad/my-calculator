import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { reduce, SCALES, CANONICAL_MODULUS, READING_DISCLAIMER } from '../lib/engine';
import { suggestVerses, MATCH_TYPE_LABELS } from '../lib/verseSuggest';
import { loadQuranCorpus } from '../lib/quranApi';
import { buildQuranIndex, matchQuranVerses, QURAN_MATCH_TYPE_LABELS } from '../lib/quranMatch';
import { SEED_ENTRIES } from '../data/quranNumeric';
import { loadUserEntries } from '../lib/userVerses';
import { qalb, taksir, bast } from '../lib/operations';
import { mizan } from '../lib/mizan';
import { numberToLetters } from '../lib/istintaq';
import { NATURE_LABELS } from '../data/letters';
import { PLANET_LABELS } from '../data/schemes';
import { ruleById } from '../data/rules';
import { useHurufSettings } from './SettingsContext';
import NitaqWheel from './NitaqWheel';
import SelectedVersePanel from './SelectedVersePanel';
import AboutPanel from './AboutPanel';

const AMIRI = { fontFamily: '"Amiri","Scheherazade New",serif' };

const ALL_MATCH_TYPE_LABELS = { ...MATCH_TYPE_LABELS, ...QURAN_MATCH_TYPE_LABELS };

/** جلب نص المصحف كاملًا (مرة واحدة، مع تخزين محلي) — حالة: تحميل/جاهز/خطأ مع إعادة محاولة */
function useQuranCorpus() {
  const [state, setState] = useState({ status: 'loading', corpus: null, error: null });

  const load = useCallback(() => {
    setState({ status: 'loading', corpus: null, error: null });
    let cancelled = false;
    loadQuranCorpus()
      .then((corpus) => !cancelled && setState({ status: 'ready', corpus, error: null }))
      .catch((e) => !cancelled && setState({ status: 'error', corpus: null, error: e.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(load, [load]);
  return { ...state, retry: load };
}

/** الشاشة الواحدة (SPEC §5): مبدّل مقياس فوق محرك واحد — الشكل يتغير، الجوهر لا يتغير */
export default function UnifiedReducer({ onOpenRule }) {
  const [scale, setScale] = useState('word');
  const [wordInput, setWordInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [targetNumber, setTargetNumber] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [calendar, setCalendar] = useState('hijri');
  const [depth, setDepth] = useState(1); // مراتب الفتح الثلاث (R19)
  const [traceOpen, setTraceOpen] = useState(false);
  const [mizanOther, setMizanOther] = useState('');
  const { planetSchemeId, computeOptions, disclosureLevel } = useHurufSettings();

  const raw = scale === 'word' ? wordInput : scale === 'text' ? textInput : yearInput;
  const hasInput = String(raw).trim() !== '';

  const { result, error } = useMemo(() => {
    if (!hasInput) return { result: null, error: null };
    try {
      return {
        result: reduce({
          scale,
          raw: scale === 'time' ? Number(yearInput) : raw,
          options: {
            normalizeOptions: computeOptions,
            planetSchemeId,
            depth,
            disclosureLevel,
            targetNumber: scale === 'text' && targetNumber !== '' ? Number(targetNumber) : null,
            calendar,
          },
        }),
        error: null,
      };
    } catch (e) {
      return { result: null, error: e.message };
    }
  }, [scale, raw, yearInput, targetNumber, calendar, depth, disclosureLevel, computeOptions, planetSchemeId, hasInput]);

  const suggestions = useMemo(() => {
    if (!result) return [];
    return suggestVerses(result, { entries: [...SEED_ENTRIES, ...loadUserEntries()] });
  }, [result]);

  // فهرسة كامل المصحف بنفس قواعد التطبيع الفعّالة — تُعاد فقط عند تغيّر النص أو الإعدادات
  const quran = useQuranCorpus();
  const quranIndex = useMemo(
    () => (quran.corpus ? buildQuranIndex(quran.corpus, computeOptions) : null),
    [quran.corpus, computeOptions]
  );
  const quranMatches = useMemo(
    () => (result && quranIndex ? matchQuranVerses(result, quranIndex) : []),
    [result, quranIndex]
  );

  const activeChars = result ? result.letterTrace.map((t) => t.normalized) : [];
  const showAdvancedPanels = result && depth >= 3 && disclosureLevel === 'advanced' && scale !== 'time';

  return (
    <div dir="rtl" className="space-y-5">
      <SelectedVersePanel />

      {/* مبدّل المقياس — نفس المحرك خلفه (SPEC §5) */}
      <div className="flex gap-1 rounded-lg border border-[#D9CBA6] bg-white p-1">
        {SCALES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScale(s.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm ${
              scale === s.id ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* حقل الإدخال — الشيء الوحيد الذي يتغير مع المقياس */}
      {scale === 'word' && (
        <input
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          dir="rtl"
          className="w-full rounded-lg border border-[#D9CBA6] bg-white px-4 py-3 text-2xl text-[#2B2118] focus:outline focus:outline-2 focus:outline-[#2B2118]"
          style={AMIRI}
          placeholder="اكتب كلمة أو اسمًا… مثال: محمد"
          aria-label="كلمة"
        />
      )}
      {scale === 'text' && (
        <div className="space-y-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            dir="rtl"
            rows={3}
            className="w-full rounded-lg border border-[#D9CBA6] bg-white px-4 py-3 text-xl text-[#2B2118] focus:outline focus:outline-2 focus:outline-[#2B2118]"
            style={AMIRI}
            placeholder="اكتب آية أو بيت شعر… مثال: بسم الله الرحمن الرحيم"
            aria-label="نص أو آية"
          />
          <label className="flex items-center gap-2 text-sm text-[#6B4F2A]">
            <span>ابحث عن تركيبة كلمات تساوي (اختياري):</span>
            <input
              type="number"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              className="w-28 rounded border border-[#D9CBA6] bg-white px-2 py-1"
              placeholder="مثال: ١٤٤٧"
            />
          </label>
        </div>
      )}
      {scale === 'time' && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            className="w-36 rounded-lg border border-[#D9CBA6] bg-white px-4 py-3 text-2xl text-[#2B2118] focus:outline focus:outline-2 focus:outline-[#2B2118]"
            placeholder="السنة"
            aria-label="سنة"
          />
          <div className="flex gap-1 rounded-lg border border-[#D9CBA6] bg-white p-1 text-sm">
            {[
              { id: 'hijri', label: 'هجري' },
              { id: 'gregorian', label: 'ميلادي' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCalendar(c.id)}
                className={`rounded px-3 py-1 ${
                  calendar === c.id ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {calendar === 'gregorian' && (
            <span className="text-xs text-[#6B5B45]">يُحوَّل هجريًا تحويلًا حسابيًا تقريبيًا</span>
          )}
        </div>
      )}

      {!hasInput && (
        <p className="text-sm text-[#6B5B45]">
          أدخل {scale === 'word' ? 'كلمة' : scale === 'text' ? 'نصًا' : 'سنة'} أعلاه — المحرك واحد،
          والمقاييس الثلاثة أشكال له.
        </p>
      )}
      {error && <p className="rounded-lg border border-[#B5432A] bg-white p-3 text-sm text-[#B5432A]">{error}</p>}

      {result && (
        <>
          {/* الرقم المرجعي + الشبكة — دومًا معًا، لا رقم مجرد (R30) */}
          <div className="rounded-lg border border-[#D9CBA6] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-[#6B5B45]">الرقم المرجعي (إسقاط ١٠ — الياء)</div>
                <div className="text-4xl font-bold text-[#2B2118]">
                  {result.canonicalNumber}
                  <span className="mr-2 text-lg font-normal text-[#6B4F2A]" style={AMIRI}>
                    ({numberToLetters(result.canonicalNumber).letters[0].name})
                  </span>
                </div>
                {result.canonicalNumber === CANONICAL_MODULUS && (
                  <div className="mt-1 text-xs font-semibold text-[#B5432A]">
                    تمام المراتب — «الفرد يُبدَل عند الياء»: دورة جديدة
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDepth((d) => (d % 3) + 1)}
                className="rounded-lg border border-[#2B2118] px-4 py-2 text-sm text-[#2B2118] hover:bg-[#F5EEDD]"
                title="نفس المدخل بعمق تفسير أعلى (R11)"
              >
                أعد النظر — مرتبة الفتح: {depth}/٣
              </button>
            </div>

            <ul className="mt-3 grid grid-cols-2 gap-1 text-sm text-[#2B2118] sm:grid-cols-4">
              <li>المرتبة: {result.lattice.rank}</li>
              <li style={{ color: NATURE_LABELS[result.lattice.nature]?.color }}>
                الطبيعة: {NATURE_LABELS[result.lattice.nature]?.ar}
              </li>
              <li>الكوكب: {PLANET_LABELS[result.lattice.planet]}</li>
              <li>البرج: {result.lattice.burj?.name}</li>
            </ul>

            <p className="mt-3 rounded bg-[#F5EEDD] p-3 text-sm leading-relaxed">{result.reading}</p>
          </div>

          <NitaqWheel
            activeChars={activeChars}
            planetSchemeId={planetSchemeId}
            highlightBurjIndex={result.lattice.burj?.index}
          />

          {/* من أين جاء هذا الرقم؟ (R32) */}
          <div className="rounded-lg border border-[#D9CBA6] bg-white">
            <button
              type="button"
              onClick={() => setTraceOpen((o) => !o)}
              className="flex w-full items-center justify-between p-3 text-sm font-semibold text-[#6B4F2A]"
            >
              <span>من أين جاء هذا الرقم؟</span>
              <span>{traceOpen ? '▲' : '▼'}</span>
            </button>
            {traceOpen && (
              <div className="space-y-4 border-t border-[#EFE6CC] p-3">
                <div className="text-sm">
                  سلسلة الحساب: المجموع <b>{result.total}</b> ← إسقاط ١٠ ←{' '}
                  <b>{result.canonicalNumber}</b> · دورات مكتملة: {result.cyclesCompleted} · إسقاطات:
                  ٩←{result.projections.isqat9}، ١٢←{result.projections.isqat12}، ٢٨←
                  {result.projections.isqat28}، ٧←{result.projections.isqat7}، ٤←
                  {result.projections.isqat4}
                </div>

                {result.letterTrace.length > 0 && (
                  <div className="max-w-full overflow-x-auto rounded-lg border border-[#D9CBA6]">
                    <table className="w-full min-w-[520px] border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#D9CBA6] bg-[#F5EEDD] text-[#6B5B45]">
                          <th className="p-2 text-right">كما كُتب</th>
                          <th className="p-2 text-right">بعد التطبيع</th>
                          <th className="p-2 text-right">القيمة</th>
                          <th className="p-2 text-right">الطبيعة</th>
                          <th className="p-2 text-right">المرتبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.letterTrace.map((t, i) => (
                          <tr key={i} className="border-b border-[#EFE6CC]">
                            <td className="p-2">{t.original}</td>
                            <td className="p-2">{t.normalized}</td>
                            <td className="p-2">{t.value}</td>
                            <td className="p-2" style={{ color: t.letter ? NATURE_LABELS[t.letter.nature].color : undefined }}>
                              {t.letter ? NATURE_LABELS[t.letter.nature].ar : '—'}
                            </td>
                            <td className="p-2">{t.letter ? t.letter.rank : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {scale === 'text' && result.detail.chronogram && (
                  <div className="text-sm">
                    <div className="mb-1 font-medium">جُمَّل الكلمات (التأريخ الشعري)</div>
                    <div className="flex flex-wrap gap-1">
                      {result.detail.chronogram.words.map((w, i) => (
                        <span key={i} className="rounded bg-[#F5EEDD] px-2 py-1 text-xs">
                          {w} = {result.detail.chronogram.wordSums[i]}
                        </span>
                      ))}
                    </div>
                    {result.detail.chronogram.truncated && (
                      <p className="mt-1 text-xs text-[#B5432A]">
                        النص أطول من ٢٠ كلمة — بحث التركيبات معطّل حمايةً من الانفجار التوافقي.
                      </p>
                    )}
                    {result.detail.chronogram.targetYear != null && (
                      <div className="mt-2">
                        {result.detail.chronogram.matchingSubsets.length === 0 ? (
                          <p className="text-xs text-[#6B5B45]">
                            لا تركيبة تساوي {result.detail.chronogram.targetYear}.
                          </p>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {result.detail.chronogram.matchingSubsets.slice(0, 10).map((m, i) => (
                              <li key={i} className="rounded border border-[#D9CBA6] p-1">
                                {m.words.join(' + ')} = {result.detail.chronogram.targetYear}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {scale === 'time' && (
                  <div className="space-y-1 text-sm">
                    <div>
                      استنطاق السنة {result.detail.hijriYear}:{' '}
                      <span className="text-xl" style={AMIRI}>{result.detail.istintaq.text}</span>
                    </div>
                    <div>
                      أقرب سنة يقع فيها الدور على صورة الميزان (البرج السابع):{' '}
                      <b>{result.detail.nextLibraYear} هـ</b> — «الدور يدور إلى الميزان فيعتدل»
                    </div>
                    {result.detail.approximateConversion && (
                      <div className="text-xs text-[#6B5B45]">
                        السنة الميلادية {result.detail.inputYear} ← هجريًا {result.detail.hijriYear} (تحويل جدولي تقريبي)
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="mb-1 text-xs font-medium text-[#6B5B45]">
                    القواعد المنتجة لهذه النتيجة — من أبيات المنظومة:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.sourceTrace.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onOpenRule?.(id)}
                        className="rounded-full border border-[#6B4F2A] px-2 py-0.5 text-xs text-[#6B4F2A] hover:bg-[#F5EEDD]"
                        title={ruleById(id)?.verseExcerpt}
                      >
                        {id}: {ruleById(id)?.rule}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* أدوات المخطوطة الكلاسيكية — تظهر في المرتبة الثالثة للمتعمق فقط (R10/R19/R26) */}
          {showAdvancedPanels && (
            <div className="space-y-3 rounded-lg border border-[#D9CBA6] bg-white p-3">
              <div className="text-sm font-semibold text-[#6B4F2A]">تحويلات الكلمة (قلب · تكسير · بسط)</div>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div className="rounded bg-[#F5EEDD] p-2">
                  <div className="text-xs text-[#6B5B45]">قلب</div>
                  <div className="text-lg" style={AMIRI}>{qalb(raw, computeOptions).text}</div>
                </div>
                <div className="rounded bg-[#F5EEDD] p-2">
                  <div className="text-xs text-[#6B5B45]">تكسير (أول صفّين)</div>
                  <div style={AMIRI}>{taksir(raw, computeOptions).rows.slice(0, 2).join(' · ')}</div>
                </div>
                <div className="rounded bg-[#F5EEDD] p-2">
                  <div className="text-xs text-[#6B5B45]">بسط</div>
                  <div style={AMIRI}>
                    {bast(raw, computeOptions).expandedText} = {bast(raw, computeOptions).total}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EFE6CC] pt-3">
                <div className="mb-1 text-sm font-semibold text-[#6B4F2A]">موازنة مع اسم آخر</div>
                <input
                  value={mizanOther}
                  onChange={(e) => setMizanOther(e.target.value)}
                  dir="rtl"
                  className="w-full rounded border border-[#D9CBA6] px-3 py-2 text-lg"
                  style={AMIRI}
                  placeholder="الاسم الثاني…"
                />
                {mizanOther.trim() && (
                  <MizanRow a={raw} b={mizanOther} normalizeOptions={computeOptions} />
                )}
              </div>
            </div>
          )}

          {/* آيات ذات صلة عددية — من كامل المصحف (QURAN API) ومن القاعدة المحلية معًا */}
          <div className="rounded-lg border border-[#D9CBA6] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#6B4F2A]">آيات ذات صلة عددية</span>
              <span className="text-[10px] text-[#6B5B45]">مطابقة حسابية وصفية — لا تفسير ولا تكهن</span>
            </div>

            <div className="mb-1 text-xs font-medium text-[#6B5B45]">
              من كامل المصحف — أي آية توافق قواعد النظام (جُمَّل/إسقاط/استنطاق)
            </div>
            {quran.status === 'loading' && (
              <p className="text-sm text-[#6B5B45]">جارٍ تحميل نص المصحف من QURAN API…</p>
            )}
            {quran.status === 'error' && (
              <p className="text-sm text-[#B5432A]">
                تعذر تحميل نص المصحف: {quran.error}{' '}
                <button type="button" onClick={quran.retry} className="underline">
                  إعادة المحاولة
                </button>
              </p>
            )}
            {quran.status === 'ready' &&
              (quranMatches.length === 0 ? (
                <p className="text-sm text-[#6B5B45]">لا آية في المصحف توافق هذا العدد بهذه الدرجات.</p>
              ) : (
                <ul className="space-y-2">
                  {quranMatches.map((s, i) => (
                    <SuggestionItem key={i} suggestion={s} />
                  ))}
                </ul>
              ))}

            <div className="mb-1 mt-3 border-t border-[#EFE6CC] pt-2 text-xs font-medium text-[#6B5B45]">
              من القاعدة الموثّقة المحلية (أعداد صريحة · فواتح · إضافاتك)
            </div>
            {suggestions.length === 0 ? (
              <p className="text-sm text-[#6B5B45]">لا اقتراحات لهذا العدد.</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <SuggestionItem key={i} suggestion={s} />
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs leading-relaxed text-[#6B5B45]">{READING_DISCLAIMER}</p>
        </>
      )}

      <AboutPanel compact />
    </div>
  );
}

function SuggestionItem({ suggestion: s }) {
  return (
    <li className="rounded-lg border border-[#EFE6CC] p-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-[#F5EEDD] px-2 py-0.5 text-[10px] text-[#6B4F2A]">
          {ALL_MATCH_TYPE_LABELS[s.matchType] ?? s.matchType}
        </span>
        {!s.documented && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            غير موثّق
          </span>
        )}
      </div>
      <p className="mt-1 text-lg leading-relaxed" style={AMIRI}>{s.entry.textExcerpt}</p>
      <p className="text-xs text-[#6B5B45]">
        سورة {s.entry.surah}، آية {s.entry.ayahNumber}
        {s.entry.note ? ` — ${s.entry.note}` : ''}
      </p>
      <p className="mt-1 text-xs text-[#6B4F2A]">لماذا؟ {s.trace}</p>
    </li>
  );
}

function MizanRow({ a, b, normalizeOptions }) {
  const m = useMemo(() => {
    try {
      return mizan(a, b, { normalizeOptions });
    } catch {
      return null;
    }
  }, [a, b, normalizeOptions]);
  if (!m) return null;
  return (
    <div className="mt-2 rounded bg-[#F5EEDD] p-2 text-sm">
      {m.nameA} = {m.valueA} · {m.nameB} = {m.valueB} ← <b>{m.outcome}</b>
      <div className="mt-1 text-[10px] text-[#6B5B45]">{m.note}</div>
    </div>
  );
}
