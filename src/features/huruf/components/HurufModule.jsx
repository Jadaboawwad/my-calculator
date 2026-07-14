import React, { useState } from 'react';
import { HurufSettingsProvider } from './SettingsContext';
import UnifiedReducer from './UnifiedReducer';
import QuranNumericPanel from './QuranNumericPanel';
import LearnMode from './LearnMode';
import SettingsPanel from './SettingsPanel';
import AboutPanel from './AboutPanel';

const SECTIONS = [
  { id: 'reducer', label: 'الاختزال' },
  { id: 'quran', label: 'الآيات الرقمية' },
  { id: 'learn', label: 'تعلّم المنظومة' },
  { id: 'settings', label: 'الإعدادات' },
  { id: 'about', label: 'عن هذا العلم' },
];

function HurufModuleInner() {
  const [section, setSection] = useState('reducer');
  const [focusRuleId, setFocusRuleId] = useState(null);

  // رابط «أي بيت أنتج هذه القاعدة»: من شريحة قاعدة في نتيجة الاختزال إلى درسها (R16/R32)
  const openRule = (ruleId) => {
    setFocusRuleId(ruleId);
    setSection('learn');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{ background: '#F5EEDD', color: '#2B2118', fontFamily: '"IBM Plex Sans Arabic","Segoe UI",sans-serif' }}
    >
      <header className="border-b border-[#D9CBA6] bg-[#2B2118] px-4 py-3 text-[#F5EEDD]">
        <h1 className="text-lg font-bold">موحّد الاختزال — نطاق الحروف (دراسة تراثية)</h1>
        <p className="text-xs text-[#D9CBA6]">
          محرك اختزال واحد، ثلاثة مقاييس: كلمة · نص · زمن — حسب المصادر التراثية فقط
        </p>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-[#D9CBA6] bg-white px-2 py-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              section === s.id ? 'bg-[#2B2118] text-white' : 'text-[#6B4F2A] hover:bg-[#F5EEDD]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-3xl p-4">
        {section === 'reducer' && <UnifiedReducer onOpenRule={openRule} />}
        {section === 'quran' && <QuranNumericPanel />}
        {section === 'learn' && <LearnMode focusRuleId={focusRuleId} />}
        {section === 'settings' && <SettingsPanel />}
        {section === 'about' && <AboutPanel />}
      </main>
    </div>
  );
}

export default function HurufModule() {
  return (
    <HurufSettingsProvider>
      <HurufModuleInner />
    </HurufSettingsProvider>
  );
}
