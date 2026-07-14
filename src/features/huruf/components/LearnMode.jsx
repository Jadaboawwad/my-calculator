import React, { useEffect, useRef } from 'react';
import { VERSE_LESSONS } from '../data/verses';
import { RULES } from '../data/rules';
import { isqat } from '../lib/isqat';
import { numberToLetters } from '../lib/istintaq';
import NitaqWheel from './NitaqWheel';
import AboutPanel from './AboutPanel';

function LessonDemo({ demo }) {
  if (!demo) return null;
  if (demo.component === 'wheel') {
    return <NitaqWheel activeChars={demo.props?.activeChars || []} />;
  }
  if (demo.component === 'isqat') {
    const { n, modulus } = demo.props;
    return (
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-sm">
        isqat({n}, {modulus}) = <span className="text-lg font-bold">{isqat(n, modulus)}</span>
      </div>
    );
  }
  if (demo.component === 'istintaq') {
    const { n } = demo.props;
    const { text } = numberToLetters(n);
    return (
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center">
        <span className="text-sm text-[#6B5B45]">{n} ←</span>{' '}
        <span className="text-2xl" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
          {text}
        </span>
      </div>
    );
  }
  return null;
}

function RuleRow({ rule, focused }) {
  const ref = useRef(null);
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focused]);

  return (
    <li
      ref={ref}
      id={`rule-${rule.id}`}
      className={`rounded-lg border p-3 ${
        focused ? 'border-[#B5432A] bg-[#FBF3E4]' : 'border-[#D9CBA6] bg-white'
      }`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="rounded bg-[#2B2118] px-2 py-0.5 text-[10px] text-white">{rule.id}</span>
        <span className="text-[10px] text-[#6B5B45]">صفحة {rule.page} (تقريبية)</span>
      </div>
      <p className="text-base" style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}>
        {rule.verseExcerpt}
      </p>
      <p className="mt-1 text-sm text-[#2B2118]">القاعدة: {rule.rule}</p>
      <p className="mt-0.5 text-xs text-[#6B5B45]">تتحقق في: {rule.implementsAs}</p>
    </li>
  );
}

export default function LearnMode({ focusRuleId = null }) {
  return (
    <div dir="rtl" className="space-y-6">
      <AboutPanel />

      <div>
        <h2 className="mb-2 text-base font-bold text-[#6B4F2A]">
          جدول القواعد المستخرجة — أي بيت أنتج أي ميزة
        </h2>
        <p className="mb-3 text-xs text-[#6B5B45]">
          كل ميزة في التطبيق مستخرجة من بيت في المنظومة — لا ميزة «مخترعة» بلا سند نصّي. الضغط على
          شريحة قاعدة في نتيجة الاختزال يقفز إلى بيتها هنا.
        </p>
        <ol className="space-y-2">
          {RULES.map((rule) => (
            <RuleRow key={rule.id} rule={rule} focused={rule.id === focusRuleId} />
          ))}
        </ol>
      </div>

      <div>
        <h2 className="mb-2 text-base font-bold text-[#6B4F2A]">دروس المنظومة</h2>
        <p className="mb-3 text-sm text-[#6B5B45]">
          دروس المنظومة أدناه هيكل جاهز — نص كل بيت لم يُدخَل بعد بانتظار نقله من المخطوطة الأصلية؛
          الشرح والعرض الحي جاهزان لكل درس.
        </p>
        <ol className="space-y-6">
          {VERSE_LESSONS.map((lesson, i) => (
            <li key={lesson.id} className="rounded-lg border border-[#D9CBA6] bg-white p-4">
              <div className="mb-2 text-sm font-semibold text-[#6B4F2A]">الدرس {i + 1}</div>
              <div
                className="mb-2 min-h-[2rem] rounded bg-[#F5EEDD] p-2 text-center text-lg"
                style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
              >
                {lesson.verse || <span className="text-sm text-[#B5432A]">— بيت المنظومة (بانتظار الإدخال) —</span>}
              </div>
              <p className="mb-3 text-sm leading-relaxed">{lesson.explanation}</p>
              <LessonDemo demo={lesson.demo} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
