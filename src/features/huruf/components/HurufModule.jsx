import React, { useState } from 'react';
import { HurufSettingsProvider } from './SettingsContext';
import HurufDashboard from './HurufDashboard';
import OperationsPanel from './OperationsPanel';
import ChronogramTool from './ChronogramTool';
import MizanTool from './MizanTool';
import LearnMode from './LearnMode';
import SettingsPanel from './SettingsPanel';
import AboutPanel from './AboutPanel';

const SECTIONS = [
  { id: 'dashboard', label: 'لوحة التحليل', Comp: HurufDashboard },
  { id: 'operations', label: 'العمليات', Comp: OperationsPanel },
  { id: 'chronogram', label: 'التأريخ الشعري', Comp: ChronogramTool },
  { id: 'mizan', label: 'الموازنة', Comp: MizanTool },
  { id: 'learn', label: 'تعلّم المنظومة', Comp: LearnMode },
  { id: 'settings', label: 'الإعدادات', Comp: SettingsPanel },
  { id: 'about', label: 'عن هذا العلم', Comp: AboutPanel },
];

function HurufModuleInner() {
  const [section, setSection] = useState('dashboard');
  const Active = SECTIONS.find((s) => s.id === section)?.Comp || HurufDashboard;

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{ background: '#F5EEDD', color: '#2B2118', fontFamily: '"IBM Plex Sans Arabic","Segoe UI",sans-serif' }}
    >
      <header className="border-b border-[#D9CBA6] bg-[#2B2118] px-4 py-3 text-[#F5EEDD]">
        <h1 className="text-lg font-bold">نطاق الحروف — علم الحروف (دراسة تراثية)</h1>
        <p className="text-xs text-[#D9CBA6]">أداة دراسة وحساب على منظومة أصول علم الحرف — حسب المصادر التراثية فقط</p>
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
        <Active />
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
