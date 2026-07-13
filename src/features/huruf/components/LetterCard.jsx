import React from 'react';
import { NATURE_LABELS } from '../data/letters';
import { PLANET_LABELS, PLANET_SCHEMES, DEFAULT_PLANET_SCHEME_ID } from '../data/schemes';

/**
 * بطاقة تفصيلية لحرف واحد: قيمته، مرتبته، طبيعته، وكوكبه حسب المخطط المختار.
 */
export default function LetterCard({ letter, planetSchemeId = DEFAULT_PLANET_SCHEME_ID }) {
  if (!letter) return null;
  const scheme = PLANET_SCHEMES[planetSchemeId] || PLANET_SCHEMES[DEFAULT_PLANET_SCHEME_ID];
  const planet = scheme.assign(letter.abjadIndex);
  const nature = NATURE_LABELS[letter.nature];

  return (
    <div
      className="flex min-w-[7rem] flex-col items-center gap-1 rounded-lg border p-3 text-center"
      style={{ borderColor: nature.color, background: '#F5EEDD' }}
      dir="rtl"
    >
      <div className="text-3xl leading-none" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
        {letter.char}
      </div>
      <div className="text-xs text-[#6B5B45]">{letter.name}</div>
      <div className="mt-1 grid w-full grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-[#2B2118]">
        <span className="text-[#6B5B45]">الجمل الكبير</span>
        <span>{letter.kabir}</span>
        <span className="text-[#6B5B45]">الجمل الصغير</span>
        <span>{letter.saghir}</span>
        <span className="text-[#6B5B45]">المرتبة</span>
        <span>{letter.rank === 10 ? 'ياء (١٠ — تمام المراتب)' : letter.rank}</span>
        <span className="text-[#6B5B45]">الطبيعة</span>
        <span style={{ color: nature.color }}>{nature.ar}</span>
        <span className="text-[#6B5B45]">الكوكب</span>
        <span>{PLANET_LABELS[planet]}</span>
      </div>
    </div>
  );
}
