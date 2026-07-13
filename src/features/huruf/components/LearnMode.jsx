import React from 'react';
import { EXTRACTED_RULES } from '../data/rules';
import { isqat } from '../lib/isqat';
import { numberToLetters } from '../lib/istintaq';
import { reduce } from '../lib/engine';
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
  if (demo.component === 'reduce') {
    const { scale, raw } = demo.props;
    const result = reduce({ scale, raw });
    return (
      <div className="rounded-lg bg-[#F5EEDD] p-3 text-center text-sm">
        reduce({scale}, &quot;{raw}&quot;) → <span className="text-lg font-bold">{result.canonicalNumber}</span>
      </div>
    );
  }
  return null;
}

const RULE_DEMOS = [
  { ruleId: 'rule-1', demo: { component: 'reduce', props: { scale: 'word', raw: 'علي' } } },
  { ruleId: 'rule-17', demo: { component: 'isqat', props: { n: 786, modulus: 10 } } },
  { ruleId: 'rule-31', demo: { component: 'isqat', props: { n: 786, modulus: 9 } } },
  { ruleId: 'rule-33', demo: { component: 'reduce', props: { scale: 'time', raw: 1394 } } },
];

export default function LearnMode() {
  return (
    <div dir="rtl" className="space-y-6">
      <AboutPanel />
      <p className="text-sm text-[#6B5B45]">
        كل قاعدة أدناه مربوطة بالبيت الذي استُخرجت منه — انقر على أي بيت لرؤية العرض الحي.
      </p>
      <ol className="space-y-4">
        {EXTRACTED_RULES.map((rule, i) => {
          const demo = RULE_DEMOS.find((d) => d.ruleId === rule.id)?.demo;
          return (
            <li key={rule.id} className="rounded-lg border border-[#D9CBA6] bg-white p-4">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                <span className="text-sm font-semibold text-[#6B4F2A]">
                  {i + 1}. ص {rule.page}
                </span>
                <span className="text-[10px] text-[#6B5B45]">{rule.id}</span>
              </div>
              <div
                className="mb-2 rounded bg-[#F5EEDD] p-2 text-center text-lg"
                style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
              >
                {rule.verseExcerpt}
              </div>
              <p className="mb-1 text-sm font-medium">{rule.rule}</p>
              <p className="mb-2 text-xs text-[#6B5B45]">تتحقق في: {rule.implementsAs}</p>
              <LessonDemo demo={demo} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
