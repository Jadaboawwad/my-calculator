import React, { useMemo, useState } from 'react';
import { getAllQuranNumericEntries, addUserQuranEntry } from '../data/quran-numeric';
import { reduce } from '../lib/engine';
import { useHurufSettings } from './SettingsContext';

export default function QuranNumericPanel() {
  const { computeOptions, planetSchemeId, disclosureLevel } = useHurufSettings();
  const [entries, setEntries] = useState(() => getAllQuranNumericEntries());
  const [form, setForm] = useState({ surah: '', ayahNumber: '', textExcerpt: '', source: '', note: '' });
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => entries.find((e) => e.id === selectedId), [entries, selectedId]);

  const reduction = useMemo(() => {
    if (!selected?.textExcerpt) return null;
    try {
      return reduce(
        { scale: 'text', raw: selected.textExcerpt, options: computeOptions },
        { disclosureLevel, planetSchemeId, normalizeOptions: computeOptions }
      );
    } catch {
      return null;
    }
  }, [selected, computeOptions, planetSchemeId, disclosureLevel]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.textExcerpt.trim()) return;
    const added = addUserQuranEntry({
      surah: form.surah || '—',
      ayahNumber: Number(form.ayahNumber) || 0,
      textExcerpt: form.textExcerpt,
      source: form.source,
      note: form.note,
    });
    setEntries(getAllQuranNumericEntries());
    setSelectedId(added.id);
    setForm({ surah: '', ayahNumber: '', textExcerpt: '', source: '', note: '' });
  };

  return (
    <div dir="rtl" className="space-y-4">
      <p className="text-sm text-[#6B5B45]">
        الحروف المقطّعة والآيات ذات الأرقام — تُمرَّر عبر نفس محرك الاختزال. أي إدخال بلا مصدر يُعلَّم
        «غير موثّق».
      </p>

      <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-[#D9CBA6] bg-white p-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => setSelectedId(entry.id)}
              className={`w-full rounded px-2 py-1.5 text-right text-sm ${
                selectedId === entry.id ? 'bg-[#2B2118] text-white' : 'hover:bg-[#F5EEDD]'
              } ${entry.undocumented ? 'border-r-4 border-[#B5432A]' : ''}`}
            >
              <span style={{ fontFamily: '"Amiri",serif' }}>{entry.textExcerpt}</span>
              <span className="mx-1 text-xs opacity-70">
                — {entry.surah} {entry.ayahNumber}
              </span>
              {entry.undocumented && <span className="text-[10px] text-[#B5432A]">غير موثّق</span>}
            </button>
          </li>
        ))}
      </ul>

      {selected && reduction && (
        <div className="rounded-lg border border-[#D9CBA6] bg-white p-3 text-sm">
          <div className="mb-1 font-medium">اختزال: {selected.textExcerpt}</div>
          <p>{reduction.reading}</p>
          <p className="mt-1 text-xs text-[#6B5B45]">المصدر: {selected.source}</p>
        </div>
      )}

      <form onSubmit={handleAdd} className="space-y-2 rounded-lg border border-[#D9CBA6] bg-white p-3">
        <div className="text-sm font-semibold">إضافة آية (مصدر إلزامي)</div>
        <input
          placeholder="نص الآية أو المقطع"
          value={form.textExcerpt}
          onChange={(e) => setForm((f) => ({ ...f, textExcerpt: e.target.value }))}
          className="w-full rounded border border-[#D9CBA6] px-2 py-1.5"
          dir="rtl"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="السورة"
            value={form.surah}
            onChange={(e) => setForm((f) => ({ ...f, surah: e.target.value }))}
            className="rounded border border-[#D9CBA6] px-2 py-1.5"
          />
          <input
            placeholder="رقم الآية"
            type="number"
            value={form.ayahNumber}
            onChange={(e) => setForm((f) => ({ ...f, ayahNumber: e.target.value }))}
            className="rounded border border-[#D9CBA6] px-2 py-1.5"
          />
        </div>
        <input
          placeholder="مصدر التصنيف (مفسّر/كتاب) *"
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          className="w-full rounded border border-[#D9CBA6] px-2 py-1.5"
        />
        <button type="submit" className="rounded-lg bg-[#2B2118] px-4 py-2 text-sm text-white">
          إضافة
        </button>
      </form>
    </div>
  );
}
