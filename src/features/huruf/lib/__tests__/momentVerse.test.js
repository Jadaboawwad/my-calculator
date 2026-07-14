import { describe, it, expect } from 'vitest';
import { reduceMoment } from '../momentVerse';
import { suggestVerses } from '../verseSuggest';

describe('momentVerse — اختزال اللحظة عبر المحرك الموحد', () => {
  const fixedDate = new Date(2026, 6, 14, 10, 30); // ١٤ تموز ٢٠٢٦، ١٠:٣٠

  it('حتمي: نفس اللحظة تعطي نفس النتيجة', () => {
    const a = reduceMoment(fixedDate);
    const b = reduceMoment(fixedDate);
    expect(a.result.canonicalNumber).toBe(b.result.canonicalNumber);
    expect(a.result.total).toBe(b.result.total);
    expect(a.hijri).toEqual(b.hijri);
  });

  it('يمر عبر المحرك الموحد بمقياس النص، وأثره يذكر قواعد المصدر', () => {
    const { result, parts } = reduceMoment(fixedDate);
    expect(result.scale).toBe('text');
    expect(result.canonicalNumber).toBeGreaterThanOrEqual(1);
    expect(result.canonicalNumber).toBeLessThanOrEqual(10);
    expect(result.sourceTrace).toContain('R17');
    expect(parts.date).toBeTruthy();
    expect(parts.time).toBeTruthy();
  });

  it('الرقم المختار يغيّر المدخل والاستنطاق يظهر في الأجزاء', () => {
    const without = reduceMoment(fixedDate);
    const withNum = reduceMoment(fixedDate, { selectedNumber: 7 });
    expect(withNum.parts.number).toBe('ز'); // ٧ ← زاي
    expect(withNum.result.total).not.toBe(without.result.total);
  });

  it('الرقم المختار الفاسد يُتجاهل بهدوء', () => {
    const a = reduceMoment(fixedDate, { selectedNumber: 'ليس رقمًا' });
    const b = reduceMoment(fixedDate);
    expect(a.result.total).toBe(b.result.total);
    expect(a.parts.number).toBeNull();
  });

  it('نتيجته تصلح مدخلًا لاقتراح الآيات', () => {
    const { result } = reduceMoment(fixedDate);
    const suggestions = suggestVerses(result);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].trace).toBeTruthy();
  });

  it('دقيقة مختلفة تعطي مدخلًا مختلفًا (تنوع لحظي)', () => {
    const a = reduceMoment(new Date(2026, 6, 14, 10, 30));
    const b = reduceMoment(new Date(2026, 6, 14, 10, 31));
    expect(a.result.total).not.toBe(b.result.total);
  });
});
