import React from 'react';
import { useHurufSettings } from './SettingsContext';
import { VALUE_SCHEMES, PLANET_SCHEMES } from '../data/schemes';
import AboutPanel from './AboutPanel';

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-[#D9CBA6] bg-white p-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Choice({ label, value, options, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-[#D9CBA6] bg-white p-2 text-sm">
      <span>{label}</span>
      <select
        className="rounded border border-[#D9CBA6] bg-white px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SettingsPanel() {
  const {
    normalizeOptions,
    setNormalizeOptions,
    planetSchemeId,
    setPlanetSchemeId,
    valueSchemeId,
    setValueSchemeId,
    disclosureLevel,
    setDisclosureLevel,
    resetSettings,
  } = useHurufSettings();

  return (
    <div dir="rtl" className="space-y-5">
      <div className="space-y-2">
        <div className="text-sm font-semibold">مستوى الإفصاح</div>
        <Choice
          label="المستوى"
          value={disclosureLevel}
          onChange={setDisclosureLevel}
          options={[
            { value: 'beginner', label: 'مبتدئ' },
            { value: 'advanced', label: 'متعمق' },
          ]}
        />
        <p className="text-xs text-[#6B4F2A]">يغيّر عمق القراءة النصية فقط، لا الأرقام المحسوبة.</p>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">مخطط القيم (حساب الجمل)</div>
        <Choice
          label="النظام"
          value={valueSchemeId}
          onChange={setValueSchemeId}
          options={Object.values(VALUE_SCHEMES).map((s) => ({ value: s.id, label: s.label }))}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">مخطط الكواكب</div>
        <Choice
          label="المخطط"
          value={planetSchemeId}
          onChange={setPlanetSchemeId}
          options={Object.values(PLANET_SCHEMES).map((s) => ({ value: s.id, label: s.label }))}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">قواعد تطبيع النص</div>
        <Toggle
          label="الهمزات (أ إ آ ء ؤ ئ) تُحسب ألفًا"
          checked={normalizeOptions.hamzaAsAlif}
          onChange={(v) => setNormalizeOptions({ hamzaAsAlif: v })}
        />
        <Toggle
          label="ؤ تُحسب واوًا (بدل ألف)"
          checked={normalizeOptions.hamzaWawAsWaw}
          onChange={(v) => setNormalizeOptions({ hamzaWawAsWaw: v })}
        />
        <Toggle
          label="ئ تُحسب ياءً (بدل ألف)"
          checked={normalizeOptions.hamzaYaAsYa}
          onChange={(v) => setNormalizeOptions({ hamzaYaAsYa: v })}
        />
        <Choice
          label="التاء المربوطة (ة)"
          value={normalizeOptions.taMarbutaAs}
          onChange={(v) => setNormalizeOptions({ taMarbutaAs: v })}
          options={[
            { value: 'ha', label: 'هاء' },
            { value: 'ta', label: 'تاء' },
          ]}
        />
        <Choice
          label="الألف المقصورة (ى)"
          value={normalizeOptions.alifMaqsuraAs}
          onChange={(v) => setNormalizeOptions({ alifMaqsuraAs: v })}
          options={[
            { value: 'ya', label: 'ياء' },
            { value: 'alif', label: 'ألف' },
          ]}
        />
        <Toggle
          label="الشدّة تُحسب حرفين (بدل حرف واحد)"
          checked={normalizeOptions.countShadda}
          onChange={(v) => setNormalizeOptions({ countShadda: v })}
        />
      </div>

      <button
        onClick={resetSettings}
        className="rounded-lg border border-[#D9CBA6] px-3 py-1.5 text-xs text-[#6B4F2A] hover:bg-[#F5EEDD]"
      >
        إعادة الإعدادات الافتراضية
      </button>

      <AboutPanel />
    </div>
  );
}
