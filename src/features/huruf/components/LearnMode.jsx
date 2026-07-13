import React from 'react';
import { VERSE_LESSONS } from '../data/verses';
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

export default function LearnMode() {
  return (
    <div dir="rtl" className="space-y-6">
      <AboutPanel />
      <p className="text-sm text-[#6B5B45]">
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
  );
}
