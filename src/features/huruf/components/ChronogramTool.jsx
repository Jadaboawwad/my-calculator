import React, { useMemo, useState } from 'react';
import { decodeChronogram, composeChronogram, hijriToGregorian, gregorianToHijri } from '../lib/chronogram';
import { useHurufSettings } from './SettingsContext';

const inputCls =
  'w-full rounded-lg border border-[#D9CBA6] bg-white px-3 py-2 focus:outline focus:outline-2 focus:outline-[#2B2118]';

function DecodeMode() {
  const [verse, setVerse] = useState('بسم الله الرحمن الرحيم');
  const [year, setYear] = useState('786');
  const { computeOptions } = useHurufSettings();
  const targetYear = year.trim() ? Number(year) : null;
  const result = useMemo(
    () => decodeChronogram(verse, targetYear, computeOptions),
    [verse, targetYear, computeOptions]
  );

  return (
    <div className="space-y-3" dir="rtl">
      <label className="block text-sm">
        <span className="mb-1 block">النص (بيت أو شطر شعري)</span>
        <textarea
          dir="rtl"
          className={inputCls}
          rows={2}
          value={verse}
          onChange={(e) => setVerse(e.target.value)}
          style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block">العام المستهدف (اختياري)</span>
        <input className={inputCls} value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
      </label>

      <div className="flex flex-wrap gap-2">
        {result.words.map((w, i) => {
          const matched = result.matchingSubsets.some((s) => s.indices.includes(i));
          return (
            <span
              key={i}
              className={`rounded-lg border px-2 py-1 text-sm ${
                matched ? 'border-[#B5432A] bg-[#B5432A]/10 font-bold' : 'border-[#D9CBA6]'
              }`}
              style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
              title={`جمل: ${result.wordSums[i]}`}
            >
              {w} <span className="text-[10px] text-[#6B5B45]">({result.wordSums[i]})</span>
            </span>
          );
        })}
      </div>

      <div className="rounded-lg bg-[#F5EEDD] p-3 text-sm">
        مجموع النص كاملًا: <span className="font-bold">{result.total}</span>
        {targetYear != null && (
          <span className="mr-3">
            مجموعات كلمات تساوي {targetYear}:{' '}
            {result.matchingSubsets.length > 0
              ? result.matchingSubsets.map((s) => s.words.join(' ')).join(' | ')
              : 'لا يوجد'}
          </span>
        )}
      </div>
    </div>
  );
}

function ComposeMode() {
  const [year, setYear] = useState('1394');
  const { computeOptions } = useHurufSettings();
  const n = Number(year) || 0;
  const result = n > 0 ? composeChronogram(n, computeOptions) : null;

  return (
    <div className="space-y-3" dir="rtl">
      <label className="block text-sm">
        <span className="mb-1 block">العام المستهدف (مثال الكتاب: ١٣٩٤ هـ)</span>
        <input className={inputCls} value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
      </label>
      {result && (
        <>
          <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-3xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
            {result.letterSuggestion.text}
          </div>
          <div className="text-sm">
            كلمات من المعجم المتاح محليًا يطابق جملها هذا العام:{' '}
            {result.lexiconMatches.length > 0 ? result.lexiconMatches.join('، ') : 'لا مطابقات'}
          </div>
        </>
      )}
    </div>
  );
}

function CalendarConverter() {
  const [g, setG] = useState({ year: 2026, month: 7, day: 13 });
  const [h, setH] = useState(() => gregorianToHijri(2026, 7, 13));

  const onGregorianChange = (patch) => {
    const next = { ...g, ...patch };
    setG(next);
    setH(gregorianToHijri(next.year, next.month, next.day));
  };

  return (
    <div className="mt-4 rounded-lg border border-[#D9CBA6] bg-white p-3 text-sm" dir="rtl">
      <div className="mb-2 font-medium">تقويم هجري⇄ميلادي (حسابي تقريبي)</div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          className="w-20 rounded border border-[#D9CBA6] px-2 py-1"
          value={g.year}
          onChange={(e) => onGregorianChange({ year: Number(e.target.value) })}
        />
        <input
          type="number"
          className="w-16 rounded border border-[#D9CBA6] px-2 py-1"
          value={g.month}
          onChange={(e) => onGregorianChange({ month: Number(e.target.value) })}
        />
        <input
          type="number"
          className="w-16 rounded border border-[#D9CBA6] px-2 py-1"
          value={g.day}
          onChange={(e) => onGregorianChange({ day: Number(e.target.value) })}
        />
        <span>ميلادي ←</span>
        <span className="font-bold">
          {h.year}/{h.month}/{h.day} هـ
        </span>
      </div>
      <p className="mt-1 text-[10px] text-[#6B5B45]">
        تقويم جدولي حسابي تقريبي، وليس مرصودًا فلكيًا — لا يُعتمد لتحديد المناسبات الشرعية.
      </p>
    </div>
  );
}

export default function ChronogramTool() {
  const [mode, setMode] = useState('decode');

  return (
    <div dir="rtl">
      <div className="mb-4 flex gap-2 border-b border-[#D9CBA6] pb-2">
        <button
          onClick={() => setMode('decode')}
          className={`rounded-t-lg px-3 py-1.5 text-sm ${mode === 'decode' ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'}`}
        >
          فكّ تاريخ
        </button>
        <button
          onClick={() => setMode('compose')}
          className={`rounded-t-lg px-3 py-1.5 text-sm ${mode === 'compose' ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'}`}
        >
          صُغ تاريخًا
        </button>
      </div>
      {mode === 'decode' ? <DecodeMode /> : <ComposeMode />}
      <CalendarConverter />
    </div>
  );
}
