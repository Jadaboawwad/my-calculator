import React, { useMemo, useState } from 'react';
import { mizan } from '../lib/mizan';
import { useHurufSettings } from './SettingsContext';

const inputCls =
  'w-full rounded-lg border border-[#D9CBA6] bg-white px-3 py-2 text-lg focus:outline focus:outline-2 focus:outline-[#2B2118]';

const MODULI = [
  { value: 9, label: '٩' },
  { value: 12, label: '١٢' },
  { value: 7, label: '٧' },
];

export default function MizanTool() {
  const [nameA, setNameA] = useState('محمد');
  const [nameB, setNameB] = useState('علي');
  const [modulus, setModulus] = useState(9);
  const { computeOptions } = useHurufSettings();

  const result = useMemo(
    () => mizan(nameA, nameB, { modulus, normalizeOptions: computeOptions }),
    [nameA, nameB, modulus, computeOptions]
  );

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block">الاسم الأول</span>
          <input
            dir="rtl"
            className={inputCls}
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">الاسم الثاني</span>
          <input
            dir="rtl"
            className={inputCls}
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
          />
        </label>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span>الإسقاط:</span>
        {MODULI.map((m) => (
          <button
            key={m.value}
            onClick={() => setModulus(m.value)}
            className={`rounded-full border px-3 py-1 text-xs ${
              modulus === m.value ? 'border-[#2B2118] bg-[#2B2118] text-white' : 'border-[#D9CBA6]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-[#F5EEDD] p-3">
          <div className="text-xs text-[#6B5B45]">{nameA}</div>
          <div className="text-2xl font-bold">{result.valueA}</div>
        </div>
        <div className="rounded-lg bg-[#F5EEDD] p-3">
          <div className="text-xs text-[#6B5B45]">{nameB}</div>
          <div className="text-2xl font-bold">{result.valueB}</div>
        </div>
      </div>

      <div className="rounded-lg border border-[#D9CBA6] bg-white p-3 text-center">
        <div className="text-lg font-semibold">{result.outcome}</div>
        <p className="mt-1 text-xs text-[#6B5B45]">{result.note}</p>
      </div>
    </div>
  );
}
