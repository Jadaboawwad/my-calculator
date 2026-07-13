import React, { useMemo } from 'react';
import { verseOfTheDay } from '../lib/verseOfDay';

/**
 * الآية المختارة — عرض توضيحي ثابت أعلى اللوحة يربط تاريخ اليوم (مُختزلًا بإسقاط ٩) بآية
 * من المعجم المتوفر محليًا. توضيحي فقط، لا تكهن ولا توصية شخصية.
 */
export default function SelectedVersePanel() {
  const { dateNumber, matchedNumber, verse } = useMemo(() => verseOfTheDay(), []);
  if (!verse) return null;

  return (
    <div className="rounded-lg border border-[#D9CBA6] bg-white p-3" dir="rtl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
        <span className="text-sm font-semibold text-[#6B4F2A]">الآية المختارة</span>
        <span className="text-[10px] text-[#6B5B45]">
          حسب تاريخ اليوم (إسقاط ٩) — عرض توضيحي لآلية الاستنطاق، لا تكهن
        </span>
      </div>
      <p className="text-lg leading-relaxed" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
        {verse.text}
      </p>
      <p className="mt-1 text-xs text-[#6B5B45]">
        سورة {verse.surah}، آية {verse.ayah} — مرتبطة بالرقم {matchedNumber}
        {matchedNumber !== dateNumber && ` (أقرب رقم متوفر لإسقاط اليوم ${dateNumber})`}
      </p>
    </div>
  );
}
