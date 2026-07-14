import React, { useMemo, useState } from 'react';
import { reduce } from '../lib/engine';
import { SEED_ENTRIES, QURAN_NUMERIC_CATEGORIES, isDocumented } from '../data/quranNumeric';
import { loadUserEntries, addUserEntry, removeUserEntry } from '../lib/userVerses';

const AMIRI = { fontFamily: '"Amiri","Scheherazade New",serif' };

/** القيمة الجُمَّلية الحية لمقتطف — عبر نفس المحرك، عرضًا فقط بلا ادّعاء (SPEC §4) */
function liveCanonical(textExcerpt) {
  try {
    const r = reduce({ scale: 'text', raw: textExcerpt });
    return { total: r.total, canonical: r.canonicalNumber };
  } catch {
    return null;
  }
}

function EntryRow({ entry, onRemove }) {
  const live = useMemo(() => liveCanonical(entry.textExcerpt), [entry.textExcerpt]);
  return (
    <li className="rounded-lg border border-[#EFE6CC] bg-white p-2">
      <div className="flex flex-wrap items-center gap-2">
        {entry.numericValue != null && (
          <span className="rounded bg-[#2B2118] px-2 py-0.5 text-[10px] text-white">
            العدد الصريح: {entry.numericValue}
          </span>
        )}
        {live && (
          <span className="rounded bg-[#F5EEDD] px-2 py-0.5 text-[10px] text-[#6B4F2A]">
            جُمَّل المقتطف: {live.total} ← مرجعي {live.canonical}
          </span>
        )}
        {!isDocumented(entry) && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            غير موثّق
          </span>
        )}
      </div>
      <p className="mt-1 text-lg leading-relaxed" style={AMIRI}>{entry.textExcerpt}</p>
      <p className="text-xs text-[#6B5B45]">
        سورة {entry.surah}، آية {entry.ayahNumber}
        {entry.note ? ` — ${entry.note}` : ''}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[10px] text-[#6B5B45]">
          المصدر: {isDocumented(entry) ? entry.source : '— (أدخل مصدرًا ليُعتمد التصنيف)'}
        </p>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="text-[10px] text-[#B5432A] underline"
          >
            حذف
          </button>
        )}
      </div>
    </li>
  );
}

const EMPTY_FORM = { surah: '', ayahNumber: '', textExcerpt: '', numericValue: '', source: '', note: '' };

export default function QuranNumericPanel() {
  const [userEntries, setUserEntries] = useState(() => loadUserEntries());
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [openCategory, setOpenCategory] = useState('muqattaat');

  const grouped = useMemo(() => {
    const all = [...SEED_ENTRIES, ...userEntries];
    const g = { muqattaat: [], explicit_number: [], user_curated: [] };
    for (const e of all) g[e.category]?.push(e);
    return g;
  }, [userEntries]);

  const submit = (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      addUserEntry(form);
      setUserEntries(loadUserEntries());
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const remove = (id) => {
    removeUserEntry(id);
    setUserEntries(loadUserEntries());
  };

  const field = (key, props = {}) => (
    <input
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      className="w-full rounded border border-[#D9CBA6] bg-white px-2 py-1.5 text-sm"
      dir="rtl"
      {...props}
    />
  );

  return (
    <div dir="rtl" className="space-y-5">
      <p className="text-sm leading-relaxed text-[#6B5B45]">
        الوحدة القرآنية: توثيق لغوي/تاريخي لظاهرة الحروف المقطّعة والآيات ذات الأعداد — القيم
        الجُمَّلية تُعرض حسابيًا فقط، بلا أي تفسير أو ادّعاء إعجازي. كل تصنيف يحتاج مصدرًا؛ ما لا
        مصدر له يُعلَّم «غير موثّق» ولا يُعرض كحقيقة مؤكدة.
      </p>

      <div className="flex gap-1 rounded-lg border border-[#D9CBA6] bg-white p-1 text-sm">
        {Object.entries(QURAN_NUMERIC_CATEGORIES).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setOpenCategory(id)}
            className={`flex-1 rounded-md px-2 py-1.5 ${
              openCategory === id ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'
            }`}
          >
            {label} ({grouped[id].length})
          </button>
        ))}
      </div>

      {openCategory === 'muqattaat' && (
        <p className="text-xs text-[#6B5B45]">قيمة جُمَّلية فقط — بلا تفسير (فواتح ٢٩ سورة).</p>
      )}

      <ul className="space-y-2">
        {grouped[openCategory].map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            onRemove={entry.category === 'user_curated' ? remove : null}
          />
        ))}
        {grouped[openCategory].length === 0 && (
          <li className="text-sm text-[#6B5B45]">لا مدخلات بعد في هذا الصنف.</li>
        )}
      </ul>

      <form onSubmit={submit} className="space-y-2 rounded-lg border border-[#D9CBA6] bg-white p-3">
        <div className="text-sm font-semibold text-[#6B4F2A]">إضافة آية (بمصدر تصنيف)</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {field('surah', { placeholder: 'اسم السورة *' })}
          {field('ayahNumber', { placeholder: 'رقم الآية *', type: 'number', min: 1 })}
        </div>
        {field('textExcerpt', { placeholder: 'نص الآية أو مقتطفها *', style: AMIRI })}
        <div className="grid gap-2 sm:grid-cols-2">
          {field('numericValue', { placeholder: 'العدد الصريح في الآية (اختياري)', type: 'number' })}
          {field('source', { placeholder: 'مصدر التصنيف (مفسّر/كتاب) — بدونه تُعلَّم «غير موثّق»' })}
        </div>
        {field('note', { placeholder: 'ملاحظة (اختياري)' })}
        {formError && <p className="text-xs text-[#B5432A]">{formError}</p>}
        <button
          type="submit"
          className="rounded-lg bg-[#2B2118] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          إضافة
        </button>
      </form>
    </div>
  );
}
