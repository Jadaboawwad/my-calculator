import React, { useMemo, useState } from 'react';
import { computeProfile } from '../lib/profile';
import { dawrOf } from '../lib/dawr';
import { NATURE_LABELS } from '../data/letters';
import { PLANET_LABELS } from '../data/schemes';
import { useHurufSettings } from './SettingsContext';
import NitaqWheel from './NitaqWheel';
import AboutPanel from './AboutPanel';

function NumberChip({ label, value, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(value)}
      className="flex flex-col items-center rounded-lg border border-[#D9CBA6] bg-white px-3 py-2 text-center hover:bg-[#F5EEDD] focus:outline focus:outline-2 focus:outline-[#2B2118]"
    >
      <span className="text-[11px] text-[#6B5B45]">{label}</span>
      <span className="text-lg font-bold text-[#2B2118]">{value}</span>
    </button>
  );
}

export default function HurufDashboard() {
  const [text, setText] = useState('');
  const [openNumber, setOpenNumber] = useState(null);
  const { planetSchemeId, computeOptions } = useHurufSettings();

  const profile = useMemo(() => {
    if (!text.trim()) return null;
    try {
      return computeProfile(text, { normalizeOptions: computeOptions, planetSchemeId });
    } catch {
      return null;
    }
  }, [text, computeOptions, planetSchemeId]);

  const activeChars = profile ? profile.letterTrace.map((t) => t.normalized) : [];
  const dawrInfo = openNumber != null ? dawrOf(openNumber) : null;
  const totalNature = profile
    ? Object.values(profile.natureCounts).reduce((a, b) => a + b, 0) || 1
    : 1;

  return (
    <div dir="rtl" className="space-y-5">
      <div>
        <label htmlFor="huruf-input" className="mb-1 block text-sm font-medium text-[#2B2118]">
          اكتب اسمًا أو آيةً أو شطرًا…
        </label>
        <input
          id="huruf-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir="rtl"
          className="w-full rounded-lg border border-[#D9CBA6] bg-white px-4 py-3 text-2xl text-[#2B2118] focus:outline focus:outline-2 focus:outline-[#2B2118]"
          style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
          placeholder="مثال: بسم الله الرحمن الرحيم"
        />
      </div>

      {!profile && (
        <p className="text-sm text-[#6B5B45]">اكتب نصًا عربيًا أعلاه لعرض تحليله حسب المنظومة.</p>
      )}

      {profile && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            <NumberChip label="الجمل الكبير" value={profile.kabir} onOpen={setOpenNumber} />
            <NumberChip label="الجمل الصغير" value={profile.saghir} onOpen={setOpenNumber} />
            <NumberChip label="إسقاط ٩" value={profile.isqat9} onOpen={setOpenNumber} />
            <NumberChip label="إسقاط ١٢ (البرج)" value={profile.isqat12} onOpen={setOpenNumber} />
            <NumberChip label="إسقاط ٧ (الكوكب)" value={profile.isqat7} onOpen={setOpenNumber} />
            <NumberChip label="إسقاط ٤ (الطبيعة)" value={profile.isqat4} onOpen={setOpenNumber} />
          </div>

          {dawrInfo && (
            <div className="rounded-lg border border-[#D9CBA6] bg-white p-3 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">دور العدد {openNumber}</span>
                <button className="text-xs text-[#6B5B45] underline" onClick={() => setOpenNumber(null)}>
                  إغلاق
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-1 text-[#2B2118] sm:grid-cols-4">
                <li>المرتبة: {dawrInfo.rank10}{dawrInfo.isRankPivot ? ' (تمام المراتب — الياء)' : ''}</li>
                <li>البرج: {dawrInfo.burj?.name}</li>
                <li>الكوكب: {PLANET_LABELS[dawrInfo.planet]}</li>
                <li>حسب المنظومة</li>
              </ul>
            </div>
          )}

          <div>
            <div className="mb-1 text-sm font-medium">غلبة الطبائع</div>
            <div className="flex h-4 w-full overflow-hidden rounded-full border border-[#D9CBA6]">
              {Object.entries(profile.natureCounts).map(([nature, count]) => (
                <div
                  key={nature}
                  style={{
                    width: `${(count / totalNature) * 100}%`,
                    background: NATURE_LABELS[nature].color,
                  }}
                  title={`${NATURE_LABELS[nature].ar}: ${count}`}
                />
              ))}
            </div>
            <div className="mt-1 text-xs text-[#6B5B45]">
              الطبيعة الغالبة: {profile.dominantNature ? NATURE_LABELS[profile.dominantNature].ar : '—'}
              {' · '}
              الكوكب الغالب: {profile.dominantPlanet ? PLANET_LABELS[profile.dominantPlanet] : '—'}
              {' · '}
              البرج (حسب إسقاط ١٢): {profile.burj?.name}
            </div>
          </div>

          <NitaqWheel
            activeChars={activeChars}
            planetSchemeId={planetSchemeId}
            highlightBurjIndex={profile.isqat12}
          />

          <div>
            <div className="mb-1 text-sm font-medium">أثر الحروف (letter trace) — للتحقق اليدوي</div>
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
                  {profile.letterTrace.map((t, i) => (
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
          </div>
        </>
      )}

      <AboutPanel compact />
    </div>
  );
}
