import React, { useMemo, useState } from 'react';
import { HURUF_LETTERS, NATURE_LABELS } from '../data/letters';
import { PLANET_SCHEMES, PLANET_LABELS, DEFAULT_PLANET_SCHEME_ID, BURUJ } from '../data/schemes';

// نطاق الحروف — العنصر المميّز: دوائر متحدة المركز (حروف ← مراتب ← طبائع ← كواكب ← بروج)
// الطبيعة والكوكب موزّعان دوريًا لا في أرباع متجاورة (كما تنص المنظومة)، لذا نلوّن كل حرف
// بمفرده بدل رسم قطاعات كبيرة قد تُوهم بتجاور غير موجود فعليًا في التوزيع.

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

const LETTER_RING_R = 165;
const PLANET_RING_R = 130;
const RANK_RING_R = 100;
const BURJ_RING_R = 62;
const CENTER_R = 22;
const SIZE = 380;
const CENTER = SIZE / 2;

export default function NitaqWheel({
  activeChars = [],
  planetSchemeId = DEFAULT_PLANET_SCHEME_ID,
  highlightBurjIndex = null,
  onLetterClick = null,
}) {
  const [asTable, setAsTable] = useState(false);
  const scheme = PLANET_SCHEMES[planetSchemeId] || PLANET_SCHEMES[DEFAULT_PLANET_SCHEME_ID];

  const activeSet = useMemo(() => new Set(activeChars), [activeChars]);
  const hasPivot = activeChars.includes('ي');

  const letterAngle = (abjadIndex) => ((abjadIndex - 1) * 360) / 28;

  return (
    <div dir="rtl" className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 self-end">
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="rounded border border-[#6B4F2A] px-2 py-1 text-xs text-[#6B4F2A] hover:bg-[#F5EEDD] focus:outline focus:outline-2 focus:outline-[#2B2118]"
        >
          {asTable ? 'عرض كدولاب' : 'عرض كجدول (لإتاحة الوصول)'}
        </button>
      </div>

      {asTable ? (
        <WheelTable scheme={scheme} />
      ) : (
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label="نطاق الحروف: دولاب الحروف والمراتب والطبائع والكواكب والبروج"
          className="max-w-full [&_*]:transition-all [&_*]:duration-500 motion-reduce:[&_*]:transition-none"
        >
          <circle cx={CENTER} cy={CENTER} r={LETTER_RING_R + 20} fill="#F5EEDD" stroke="#D9CBA6" />

          {/* حلقة البروج (الأعمق) — دائرة الدور المستقلة، اثنا عشر قطاعًا متساويًا */}
          {BURUJ.map((b) => {
            const start = polarToCartesian(CENTER, CENTER, BURJ_RING_R, (b.index - 1) * 30);
            const isActive = highlightBurjIndex === b.index;
            return (
              <g key={b.index}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={start.x}
                  y2={start.y}
                  stroke="#D9CBA6"
                  strokeWidth={1}
                />
                <text
                  {...polarToCartesian(CENTER, CENTER, BURJ_RING_R - 14, (b.index - 1) * 30 + 15)}
                  fontSize={9}
                  textAnchor="middle"
                  fill={isActive ? '#B5432A' : '#6B5B45'}
                  fontWeight={isActive ? 700 : 400}
                >
                  {b.name}
                </text>
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r={BURJ_RING_R} fill="none" stroke="#D9CBA6" />

          {/* النقطة والألف — أصل النظام */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER_R}
            fill="#2B2118"
            className={hasPivot ? 'motion-safe:animate-spin' : ''}
            style={hasPivot ? { animationDuration: '3s' } : undefined}
          />
          <text x={CENTER} y={CENTER + 5} textAnchor="middle" fontSize={16} fill="#F5EEDD">
            ا
          </text>

          {/* حلقة المراتب */}
          <circle cx={CENTER} cy={CENTER} r={RANK_RING_R} fill="none" stroke="#D9CBA6" strokeDasharray="2 3" />

          {/* حلقة الكواكب — علامة صغيرة لكل حرف بلون كوكبه */}
          {HURUF_LETTERS.map((letter) => {
            const angle = letterAngle(letter.abjadIndex);
            const pos = polarToCartesian(CENTER, CENTER, PLANET_RING_R, angle);
            const planet = scheme.assign(letter.abjadIndex);
            return (
              <circle
                key={`planet-${letter.char}`}
                cx={pos.x}
                cy={pos.y}
                r={3.5}
                fill={PLANET_COLORS[planet]}
              >
                <title>
                  {letter.char} — {PLANET_LABELS[planet]}
                </title>
              </circle>
            );
          })}

          {/* حلقة الحروف (الأبعد) — كل حرف بلون طبيعته، مع رقم مرتبته */}
          {HURUF_LETTERS.map((letter) => {
            const angle = letterAngle(letter.abjadIndex);
            const pos = polarToCartesian(CENTER, CENTER, LETTER_RING_R, angle);
            const nature = NATURE_LABELS[letter.nature];
            const active = activeSet.has(letter.char);
            return (
              <g
                key={letter.char}
                tabIndex={0}
                role="button"
                aria-label={`${letter.name}: جمل كبير ${letter.kabir}، طبيعة ${nature.ar}، مرتبة ${letter.rank}`}
                onClick={() => onLetterClick && onLetterClick(letter)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onLetterClick) onLetterClick(letter);
                }}
                style={{ cursor: onLetterClick ? 'pointer' : 'default', outlineOffset: 3 }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={active ? 15 : 12}
                  fill={active ? nature.color : '#F5EEDD'}
                  stroke={nature.color}
                  strokeWidth={active ? 3 : 1.5}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fill={active ? '#F5EEDD' : '#2B2118'}
                  style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
                >
                  {letter.char}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + (active ? 26 : 23)}
                  textAnchor="middle"
                  fontSize={7}
                  fill="#6B5B45"
                >
                  {letter.rank}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      <Legend />
    </div>
  );
}

const PLANET_COLORS = {
  saturn: '#4B4B4B',
  jupiter: '#8A5A2B',
  mars: '#B5432A',
  sun: '#C9A227',
  venus: '#2E6E8E',
  mercury: '#6B4F2A',
  moon: '#9AA5B1',
};

function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-3 text-xs text-[#6B5B45]" dir="rtl">
      {Object.entries(NATURE_LABELS).map(([key, n]) => (
        <span key={key} className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: n.color }} />
          {n.ar}
        </span>
      ))}
    </div>
  );
}

function WheelTable({ scheme }) {
  return (
    <div className="w-full max-w-xl overflow-x-auto" dir="rtl">
      <table className="w-full border-collapse text-xs">
        <caption className="mb-1 text-right text-[#6B5B45]">
          الجدول المكافئ لدولاب نطاق الحروف — الحروف الثمانية والعشرون مرتبة بحسب الأبجد
        </caption>
        <thead>
          <tr className="border-b border-[#D9CBA6] text-[#6B5B45]">
            <th className="p-1 text-right">الحرف</th>
            <th className="p-1 text-right">الجمل الكبير</th>
            <th className="p-1 text-right">المرتبة</th>
            <th className="p-1 text-right">الطبيعة</th>
            <th className="p-1 text-right">الكوكب</th>
          </tr>
        </thead>
        <tbody>
          {HURUF_LETTERS.map((letter) => (
            <tr key={letter.char} className="border-b border-[#EFE6CC]">
              <td className="p-1 font-semibold">
                {letter.char} <span className="text-[#6B5B45]">({letter.name})</span>
              </td>
              <td className="p-1">{letter.kabir}</td>
              <td className="p-1">{letter.rank === 10 ? '١٠ (ياء)' : letter.rank}</td>
              <td className="p-1" style={{ color: NATURE_LABELS[letter.nature].color }}>
                {NATURE_LABELS[letter.nature].ar}
              </td>
              <td className="p-1">{PLANET_LABELS[scheme.assign(letter.abjadIndex)]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
