import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { reduce, sourceRulesForTrace } from '../lib/engine';
import { predictVerseNumber, fetchVerseText } from '../lib/predictedVerse';
import { FRAMEWORK_DISCLAIMER } from '../data/sources';
import { NATURE_LABELS } from '../data/letters';
import { PLANET_LABELS } from '../data/schemes';
import { useHurufSettings } from './SettingsContext';
import NitaqWheel from './NitaqWheel';
import AboutPanel from './AboutPanel';

const SCALES = [
  { id: 'word', label: 'كلمة', icon: '🔤', placeholder: 'مثال: محمد' },
  { id: 'text', label: 'نص/آية', icon: '📜', placeholder: 'مثال: بسم الله الرحمن الرحيم' },
  { id: 'time', label: 'زمن', icon: '📅', placeholder: '' },
];

function TracePanel({ result, open, onToggle }) {
  if (!result) return null;
  const rules = sourceRulesForTrace(result.sourceTrace);

  return (
    <div className="rounded-lg border border-[#D9CBA6] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-[#6B4F2A]"
      >
        <span>من أين جاء هذا الرقم؟</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-[#D9CBA6] px-3 py-2 text-xs text-[#2B2118]">
          <ul className="mb-2 space-y-1">
            {result.trace.steps.map((s, i) => (
              <li key={i}>
                {s.label}: <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
          {result.trace.nextLibraYear != null && (
            <p className="mb-2 text-[#6B5B45]">
              أقرب سنة على برج الميزان (الدور يدور إلى الميزان): {result.trace.nextLibraYear}
            </p>
          )}
          {rules.length > 0 && (
            <div>
              <div className="mb-1 font-medium">الأبيات المصدر:</div>
              <ul className="space-y-1">
                {rules.map((r) => (
                  <li key={r.id} className="text-[#6B5B45]">
                    <span className="font-medium text-[#2B2118]">{r.verseExcerpt}</span> — {r.rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReductionUnifier() {
  const { planetSchemeId, computeOptions, disclosureLevel } = useHurufSettings();
  const [scale, setScale] = useState('text');
  const [rawInput, setRawInput] = useState('');
  const [yearInput, setYearInput] = useState(new Date().getFullYear());
  const [depth, setDepth] = useState(1);
  const [traceOpen, setTraceOpen] = useState(false);
  const [error, setError] = useState(null);
  const [predicted, setPredicted] = useState(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [usePredicted, setUsePredicted] = useState(true);

  const engineOptions = useMemo(
    () => ({
      depth,
      disclosureLevel,
      planetSchemeId,
      normalizeOptions: computeOptions,
    }),
    [depth, disclosureLevel, planetSchemeId, computeOptions]
  );

  const loadPredictedVerse = useCallback(async () => {
    setVerseLoading(true);
    const pred = predictVerseNumber(new Date());
    let text = pred.text;
    let surah = pred.surah;
    let ayah = pred.ayah;

    if (!text) {
      const fetched = await fetchVerseText(pred.verseNumber);
      if (fetched) {
        text = fetched.text;
        surah = fetched.surah;
        ayah = fetched.ayah;
      }
    }

    setPredicted({ ...pred, text, surah, ayah });
    if (usePredicted && text) {
      setScale('text');
      setRawInput(text);
    }
    setVerseLoading(false);
  }, [usePredicted]);

  useEffect(() => {
    loadPredictedVerse();
  }, [loadPredictedVerse]);

  const effectiveRaw = scale === 'time' ? yearInput : rawInput;

  const result = useMemo(() => {
    setError(null);
    if (scale === 'time' && !yearInput) return null;
    if (scale !== 'time' && !rawInput.trim()) return null;
    try {
      return reduce({ scale, raw: effectiveRaw, options: computeOptions }, engineOptions);
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [scale, effectiveRaw, rawInput, yearInput, computeOptions, engineOptions]);

  const activeChars = result?.letterTrace?.map((t) => t.normalized) || [];

  const handleReconsider = () => {
    setDepth((d) => (d >= 3 ? 1 : d + 1));
  };

  const handleUsePredicted = () => {
    if (predicted?.text) {
      setUsePredicted(true);
      setScale('text');
      setRawInput(predicted.text);
    }
  };

  return (
    <div dir="rtl" className="space-y-5">
      {/* الآية المتنبأ بها — مدخل المحرك */}
      <div className="rounded-lg border-2 border-[#6B4F2A] bg-white p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#6B4F2A]">الآية المتنبأ بها (مدخل المحرك)</span>
          <span className="text-[10px] text-[#6B5B45]">حسب الزمن والحروف — عرض توضيحي، لا تكهن</span>
        </div>
        {verseLoading ? (
          <p className="text-sm text-[#6B5B45]">جاري حساب الآية وتمريرها لمحرك الاختزال…</p>
        ) : predicted ? (
          <>
            <p
              className="text-xl leading-relaxed"
              style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
            >
              {predicted.text || '— لم يُجلب النص بعد —'}
            </p>
            <p className="mt-1 text-xs text-[#6B5B45]">
              رقم الآية الكلي: {predicted.verseNumber}
              {predicted.surah && ` · سورة ${predicted.surah}، آية ${predicted.ayah}`}
              {predicted.localFallback && ' · (نص محلي تقريبي)'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUsePredicted}
                disabled={!predicted.text}
                className="rounded-lg bg-[#2B2118] px-3 py-1.5 text-xs text-white disabled:opacity-40"
              >
                اختزال هذه الآية
              </button>
              <button
                type="button"
                onClick={loadPredictedVerse}
                className="rounded-lg border border-[#D9CBA6] px-3 py-1.5 text-xs text-[#6B4F2A]"
              >
                تحديث الآية
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* مبدّل المقياس */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-[#D9CBA6] bg-white p-1">
        {SCALES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setScale(s.id);
              setUsePredicted(false);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${
              scale === s.id ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* حقل الإدخال */}
      {scale === 'time' ? (
        <div>
          <label htmlFor="year-input" className="mb-1 block text-sm font-medium">
            السنة (هجرية أو ميلادية)
          </label>
          <input
            id="year-input"
            type="number"
            min={1}
            max={99999}
            value={yearInput}
            onChange={(e) => setYearInput(Number(e.target.value))}
            className="w-full rounded-lg border border-[#D9CBA6] bg-white px-4 py-3 text-2xl focus:outline focus:outline-2 focus:outline-[#2B2118]"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="unifier-input" className="mb-1 block text-sm font-medium">
            {scale === 'word' ? 'اسم أو كلمة واحدة' : 'نص أو آية'}
          </label>
          <input
            id="unifier-input"
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              setUsePredicted(false);
            }}
            dir="rtl"
            className="w-full rounded-lg border border-[#D9CBA6] bg-white px-4 py-3 text-2xl text-[#2B2118] focus:outline focus:outline-2 focus:outline-[#2B2118]"
            style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
            placeholder={SCALES.find((s) => s.id === scale)?.placeholder}
          />
        </div>
      )}

      {error && <p className="text-sm text-[#B5432A]">{error}</p>}

      {!result && !error && (
        <p className="text-sm text-[#6B5B45]">أدخل مدخلًا صالحًا لعرض الاختزال على العجلة.</p>
      )}

      {result && (
        <>
          <div className="rounded-lg border border-[#D9CBA6] bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg font-bold">
                الرقم المرجعي: {result.canonicalNumber}
                {result.canonicalNumber === 10 && ' (الياء)'}
              </span>
              <button
                type="button"
                onClick={handleReconsider}
                className="rounded-lg border border-[#D9CBA6] px-3 py-1 text-xs hover:bg-[#F5EEDD]"
                title="أعِد نظرًا — عمق أعلى (البيت #11)"
              >
                أعد النظر (عمق {depth})
              </button>
            </div>
            <p className="text-sm leading-relaxed">{result.reading}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div>المرتبة: {result.lattice.rank}</div>
              <div>
                الطبيعة:{' '}
                {result.lattice.nature ? NATURE_LABELS[result.lattice.nature].ar : '—'}
              </div>
              <div>الكوكب: {PLANET_LABELS[result.lattice.planet] || result.lattice.planet}</div>
              <div>البرج: {result.lattice.burj?.name || '—'}</div>
            </div>
            {result.cyclesCompleted > 0 && (
              <p className="mt-1 text-xs text-[#6B5B45]">
                دورات مكتملة عند الياء: {result.cyclesCompleted}
              </p>
            )}
          </div>

          <NitaqWheel
            activeChars={activeChars}
            planetSchemeId={planetSchemeId}
            highlightBurjIndex={result.trace.isqat12}
          />

          <TracePanel result={result} open={traceOpen} onToggle={() => setTraceOpen((o) => !o)} />

          {result.chronogram && scale === 'text' && (
            <div className="rounded-lg border border-[#D9CBA6] bg-white p-3 text-xs">
              <div className="mb-1 font-medium">جُمَّل الكلمات (التأريخ الشعري)</div>
              <div className="flex flex-wrap gap-2">
                {result.chronogram.words.map((w, i) => (
                  <span key={i} className="rounded bg-[#F5EEDD] px-2 py-1">
                    {w}: {result.chronogram.wordSums[i]}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-[#6B5B45]">المجموع: {result.chronogram.total}</p>
            </div>
          )}
        </>
      )}

      <p className="text-[10px] leading-relaxed text-[#6B5B45]">{FRAMEWORK_DISCLAIMER}</p>
      <AboutPanel compact />
    </div>
  );
}
