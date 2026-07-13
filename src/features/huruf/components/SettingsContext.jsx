import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_NORMALIZE_OPTIONS } from '../lib/normalize';
import { DEFAULT_PLANET_SCHEME_ID } from '../data/schemes';
import { DEFAULT_VALUE_SCHEME_ID } from '../data/schemes';

const STORAGE_KEY = 'huruf.settings.v1';

const DEFAULT_SETTINGS = {
  normalizeOptions: DEFAULT_NORMALIZE_OPTIONS,
  planetSchemeId: DEFAULT_PLANET_SCHEME_ID,
  valueSchemeId: DEFAULT_VALUE_SCHEME_ID,
  disclosureLevel: 'beginner',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      normalizeOptions: { ...DEFAULT_NORMALIZE_OPTIONS, ...(parsed.normalizeOptions || {}) },
      planetSchemeId: parsed.planetSchemeId || DEFAULT_PLANET_SCHEME_ID,
      valueSchemeId: parsed.valueSchemeId || DEFAULT_VALUE_SCHEME_ID,
      disclosureLevel: parsed.disclosureLevel === 'advanced' ? 'advanced' : 'beginner',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const HurufSettingsContext = createContext(null);

export function HurufSettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage غير متاح (وضع خاص مثلاً) — نتجاهل بصمت، الإعدادات تبقى في الجلسة
    }
  }, [settings]);

  const value = useMemo(
    () => ({
      ...settings,
      setNormalizeOptions: (patch) =>
        setSettings((s) => ({ ...s, normalizeOptions: { ...s.normalizeOptions, ...patch } })),
      setPlanetSchemeId: (id) => setSettings((s) => ({ ...s, planetSchemeId: id })),
      setValueSchemeId: (id) => setSettings((s) => ({ ...s, valueSchemeId: id })),
      setDisclosureLevel: (level) =>
        setSettings((s) => ({ ...s, disclosureLevel: level === 'advanced' ? 'advanced' : 'beginner' })),
      resetSettings: () => setSettings(DEFAULT_SETTINGS),
      // خيارات جاهزة للتمرير مباشرة إلى دوال lib/jummal.js وغيرها
      computeOptions: { ...settings.normalizeOptions, valueScheme: settings.valueSchemeId },
    }),
    [settings]
  );

  return <HurufSettingsContext.Provider value={value}>{children}</HurufSettingsContext.Provider>;
}

export function useHurufSettings() {
  const ctx = useContext(HurufSettingsContext);
  if (!ctx) throw new Error('useHurufSettings must be used within HurufSettingsProvider');
  return ctx;
}
