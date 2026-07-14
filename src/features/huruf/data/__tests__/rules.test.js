import { describe, it, expect } from 'vitest';
import { RULES, ruleById, CANONICAL_RULE_IDS } from '../rules';

describe('rules — جدول القواعد المستخرجة', () => {
  it('يحوي ٣٣ قاعدة بمعرّفات فريدة', () => {
    expect(RULES).toHaveLength(33);
    const ids = new Set(RULES.map((r) => r.id));
    expect(ids.size).toBe(33);
  });

  it('كل صفحة ضمن نطاق المنظومة ١٤٨–١٥١', () => {
    for (const r of RULES) {
      expect([148, 149, 150, 151]).toContain(r.page);
    }
  });

  it('كل الحقول النصية غير فارغة', () => {
    for (const r of RULES) {
      expect(r.verseExcerpt.trim()).not.toBe('');
      expect(r.rule.trim()).not.toBe('');
      expect(r.implementsAs.trim()).not.toBe('');
    }
  });

  it('قاعدتا الياء (R17/R18) تشيران إلى isqat والمرجع القانوني', () => {
    expect(ruleById('R17').implementsAs).toContain('isqat');
    expect(ruleById('R18').implementsAs).toContain('CANONICAL_MODULUS');
  });

  it('كل مفاتيح CANONICAL_RULE_IDS تشير إلى قواعد موجودة', () => {
    for (const id of Object.values(CANONICAL_RULE_IDS)) {
      expect(ruleById(id)).toBeDefined();
    }
  });
});
