import { describe, it, expect } from 'vitest';
import { rrulestr } from 'rrule';

describe('Worker Scheduler Logic', () => {
  it('correctly calculates next recurrence for daily rule', () => {
    const rrule = 'FREQ=DAILY;INTERVAL=1';
    const rule = rrulestr(rrule, { forceset: true });
    const now = new Date('2026-10-27T10:00:00Z');
    const next = rule.after(now, false);
    expect(next).toBeDefined();
    expect(next!.getTime()).toBeGreaterThan(now.getTime());
  });
});
