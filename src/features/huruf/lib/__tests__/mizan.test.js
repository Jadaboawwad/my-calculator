import { describe, it, expect } from 'vitest';
import { mizan } from '../mizan';

describe('mizan', () => {
  it('reports a traditional-framing outcome, never an advice statement', () => {
    const result = mizan('محمد', 'علي');
    expect(['تعادل', 'الاسم الأول أغلب', 'الاسم الثاني أغلب']).toContain(result.outcome);
    expect(result.note).toMatch(/تراثي/);
  });
});
