import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Pin, PinOff, BookOpen, Sparkles, Star, Compass } from 'lucide-react';
import { getNumberInfo } from './../../Quranicnumbersdatabase';
import {
  reduceMoment,
  suggestVerses,
  SEED_ENTRIES,
  loadUserEntries,
  isDocumented,
  numberToLetters,
  NATURE_LABELS,
  PLANET_LABELS,
  MUQATTAAT_GROUPS,
} from '../features/huruf';

// «ماذا أفعل الآن» — يعمل بالكامل على المحرك الموحد (SPEC v2):
// استنطاق التاريخ الهجري والوقت (+ الرقم المختار) ← reduce({scale:'text'}) ← اقتراح آيات
// من قاعدة الآيات ذات الأعداد المحلية، مع أثر «لماذا» لكل اقتراح. بلا أي نداء شبكة.

const READING_DISCLAIMER_NOTE =
  'قراءة وصفية تعليمية حسب منطق النظام التراثي — ليست تنبؤًا ولا حكمًا ولا توصية شخصية.';

/** توصية الآية من قاعدة الأرقام الأصلية (نفس المصدر الذي بُنيت منه المدخلات الصريحة) */
function recommendationFor(entry) {
  if (entry.numericValue == null) return null;
  const info = getNumberInfo(entry.numericValue);
  if (!info?.verses) return null;
  return info.verses.find((v) => v.surah === entry.surah && v.ayah === entry.ayahNumber) || null;
}

/** فاتحة السورة المقطّعة إن كانت سورة الآية من السور التسع والعشرين */
function muqattaatFor(surahName) {
  return MUQATTAAT_GROUPS.find((g) => g.surahNames.includes(surahName)) || null;
}

const WhatToDoNow = ({ selectedNumber, selectedNumberInfo }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pinned, setPinned] = useState(null);

  // الساعة تُحدَّث كل ثانية؛ الاختزال يعاد حسابه عند تغيّر الدقيقة أو الرقم المختار فقط
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const minuteKey = `${currentTime.getFullYear()}-${currentTime.getMonth()}-${currentTime.getDate()}-${currentTime.getHours()}-${currentTime.getMinutes()}`;

  const moment = useMemo(() => {
    try {
      return reduceMoment(currentTime, { selectedNumber });
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteKey, selectedNumber]);

  const suggestions = useMemo(() => {
    if (!moment) return [];
    return suggestVerses(moment.result, {
      entries: [...SEED_ENTRIES, ...loadUserEntries()],
      limit: 5,
    });
  }, [moment]);

  if (!moment) return null;

  const { result, hijri, parts } = moment;
  const main = pinned ?? suggestions[0] ?? null;
  const mainRec = main ? recommendationFor(main.entry) : null;
  const mainMuqattaat = main ? muqattaatFor(main.entry.surah) : null;
  const numberInfo = getNumberInfo(result.canonicalNumber);
  const canonicalLetter = numberToLetters(result.canonicalNumber).letters[0];

  return (
    <div className="space-y-4" dir="rtl">
      {/* رأس اللحظة */}
      <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-purple-400/50 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="text-purple-300" size={22} />
            <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {currentTime.toLocaleTimeString('ar-EG')}
            </span>
          </div>
          <div className="text-sm text-purple-200">
            {hijri.day}/{hijri.month}/{hijri.year} هـ (تحويل حسابي تقريبي)
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-lg p-3 border border-purple-300/30">
            <div className="text-xs text-purple-300 mb-1">استنطاق التاريخ الهجري</div>
            <div className="text-xl text-white font-arabic">{parts.date}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 border border-purple-300/30">
            <div className="text-xs text-purple-300 mb-1">استنطاق الوقت (ساعة · دقيقة)</div>
            <div className="text-xl text-white font-arabic">{parts.time || '—'}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 border border-purple-300/30">
            <div className="text-xs text-purple-300 mb-1">الرقم المختار</div>
            <div className="text-xl text-white font-arabic">
              {parts.number ? `${selectedNumber} ← ${parts.number}` : '—'}
            </div>
          </div>
        </div>

        {/* الرقم المرجعي + الشبكة — دومًا معًا (R30) */}
        <div className="mt-4 bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg p-4 border border-purple-400/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-purple-300">الرقم المرجعي للحظة (إسقاط ١٠ — الياء)</div>
              <div className="text-4xl font-bold text-white">
                {result.canonicalNumber}
                <span className="mr-2 text-lg font-normal text-purple-200">
                  ({canonicalLetter.name})
                </span>
              </div>
              {result.canonicalNumber === 10 && (
                <div className="mt-1 text-xs font-semibold text-yellow-300">
                  تمام المراتب — «الفرد يُبدَل عند الياء»: دورة جديدة
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-purple-100">
              <span>المرتبة: {result.lattice.rank}</span>
              <span style={{ color: NATURE_LABELS[result.lattice.nature]?.color }}>
                الطبيعة: {NATURE_LABELS[result.lattice.nature]?.ar}
              </span>
              <span>الكوكب: {PLANET_LABELS[result.lattice.planet]}</span>
              <span>البرج: {result.lattice.burj?.name}</span>
            </div>
          </div>
          {numberInfo?.significance && (
            <div className="mt-2 text-sm text-yellow-200 flex items-center gap-2">
              <Star size={14} />
              دلالة العدد {result.canonicalNumber} في قاعدة الأرقام: {numberInfo.significance}
            </div>
          )}
        </div>
      </div>

      {/* الآية الرئيسة */}
      {main && (
        <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/40 to-red-900/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-amber-400/50 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-200 font-bold">
              <BookOpen size={18} />
              <span>الآية المقترحة لهذه اللحظة</span>
              {pinned && <span className="text-xs font-normal text-amber-300">(مثبتة)</span>}
            </div>
            <button
              type="button"
              onClick={() => setPinned(pinned ? null : main)}
              className="flex items-center gap-1 text-xs text-amber-200 border border-amber-400/50 rounded-full px-3 py-1 hover:bg-amber-400/10"
            >
              {pinned ? <PinOff size={12} /> : <Pin size={12} />}
              {pinned ? 'إلغاء التثبيت' : 'تثبيت'}
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 p-4 sm:p-6 rounded-lg border border-purple-400/30">
            <p className="text-2xl sm:text-3xl text-white leading-loose text-center font-arabic">
              {main.entry.textExcerpt}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-center bg-white/10 rounded-lg p-3 border border-amber-300/30">
            <div>
              <div className="text-xs text-amber-300 mb-1">السورة</div>
              <div className="text-lg font-bold text-amber-100">{main.entry.surah}</div>
            </div>
            <div>
              <div className="text-xs text-amber-300 mb-1">الآية</div>
              <div className="text-lg font-bold text-amber-100">{main.entry.ayahNumber}</div>
            </div>
          </div>

          {mainRec && (
            <div className="mt-3 bg-gradient-to-r from-green-800/40 to-emerald-800/40 rounded-lg p-4 border border-green-400/50">
              <div className="flex items-center gap-2 text-green-200 font-bold mb-1">
                <Compass size={16} />
                <span>ماذا أفعل الآن؟ — حسب دلالة العدد في القاعدة</span>
              </div>
              <p className="text-green-100 text-lg font-bold">{mainRec.action}</p>
              <p className="text-green-200 text-sm mt-1">{mainRec.recommendation}</p>
              {mainRec.meaning && <p className="text-green-300 text-xs mt-1">المعنى: {mainRec.meaning}</p>}
            </div>
          )}

          <div className="mt-3 bg-indigo-900/30 rounded-lg p-3 border border-indigo-400/30">
            <div className="text-xs text-indigo-300 mb-1">لماذا هذه الآية؟ (أثر الاختيار — R32)</div>
            <p className="text-sm text-indigo-100">{main.trace}</p>
            {!main.documented && (
              <span className="inline-block mt-1 rounded bg-amber-200/20 border border-amber-300/50 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                غير موثّق — إضافة مستخدم بلا مصدر
              </span>
            )}
          </div>

          {mainMuqattaat && (
            <div className="mt-3 bg-purple-900/30 rounded-lg p-3 border border-purple-400/30 text-sm text-purple-100">
              <Sparkles size={14} className="inline ml-1" />
              سورة {main.entry.surah} من سور الفواتح المقطّعة: تفتتح بـ«{mainMuqattaat.opener}» (
              {mainMuqattaat.description}) — عرض جُمَّلي فقط، بلا تفسير.
            </div>
          )}

          {selectedNumber && selectedNumberInfo && (
            <div className="mt-3 p-3 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg border border-yellow-400/50">
              <p className="text-sm text-yellow-200 text-center">
                ⭐ دخل الرقم المختار {selectedNumber} في استنطاق اللحظة ({selectedNumberInfo.significance})
              </p>
            </div>
          )}
        </div>
      )}

      {/* بقية الاقتراحات */}
      {suggestions.length > 1 && (
        <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-2xl p-4 border border-gray-500/40">
          <div className="text-sm font-bold text-gray-200 mb-2">آيات أخرى ذات صلة عددية باللحظة</div>
          <ul className="space-y-2">
            {suggestions.slice(1).map((s, i) => (
              <li key={i} className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                <p className="text-lg text-gray-100 font-arabic leading-relaxed">{s.entry.textExcerpt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  سورة {s.entry.surah}، آية {s.entry.ayahNumber} — {s.trace}
                </p>
                <button
                  type="button"
                  onClick={() => setPinned(s)}
                  className="mt-1 text-xs text-purple-300 underline"
                >
                  اجعلها الرئيسة
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* القراءة المركبة + التنويه */}
      <div className="bg-white/5 rounded-xl p-4 border border-gray-500/30">
        <p className="text-sm text-gray-200 leading-relaxed">{result.reading}</p>
        <p className="text-xs text-gray-400 mt-2">{READING_DISCLAIMER_NOTE}</p>
      </div>
    </div>
  );
};

export default WhatToDoNow;
