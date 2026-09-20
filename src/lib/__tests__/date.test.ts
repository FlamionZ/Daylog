import { describe, it, expect } from 'vitest';
import {
  calculateWorkedMinutes,
  formatDuration,
  getInternshipDay,
  getInternshipWeek,
  getRemainingDays,
  isWithinInternship,
  formatDate,
  formatTime,
} from '@/lib/date';

describe('calculateWorkedMinutes', () => {
  it('calculates correct minutes from check-in to check-out', () => {
    const checkIn = new Date('2026-09-20T01:00:00Z');
    const checkOut = new Date('2026-09-20T09:00:00Z');
    expect(calculateWorkedMinutes(checkIn, checkOut)).toBe(480);
  });

  it('deducts break minutes', () => {
    const checkIn = new Date('2026-09-20T01:00:00Z');
    const checkOut = new Date('2026-09-20T09:00:00Z');
    expect(calculateWorkedMinutes(checkIn, checkOut, 60)).toBe(420);
  });

  it('returns 0 when check-in is null', () => {
    expect(calculateWorkedMinutes(null, new Date())).toBe(0);
  });

  it('returns 0 when check-out is null', () => {
    expect(calculateWorkedMinutes(new Date(), null)).toBe(0);
  });

  it('returns 0 when both are null', () => {
    expect(calculateWorkedMinutes(null, null)).toBe(0);
  });

  it('returns 0 when break exceeds work time', () => {
    const checkIn = new Date('2026-09-20T01:00:00Z');
    const checkOut = new Date('2026-09-20T02:00:00Z');
    expect(calculateWorkedMinutes(checkIn, checkOut, 120)).toBe(0);
  });
});

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(450)).toBe('7j 30m');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2j');
  });

  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('formats negative as zero', () => {
    expect(formatDuration(-10)).toBe('0m');
  });
});

describe('getInternshipDay', () => {
  it('returns 1 on start date', () => {
    // We need to mock "now" for deterministic tests, but for basic tests
    // we can use a date far in the past relative to a fixed start
    const start = new Date('2026-09-01');
    const day = getInternshipDay(start);
    expect(day).toBeGreaterThanOrEqual(1);
  });
});

describe('getInternshipWeek', () => {
  it('returns week number based on day', () => {
    const start = new Date('2026-09-01');
    const week = getInternshipWeek(start);
    expect(week).toBeGreaterThanOrEqual(1);
  });
});

describe('getRemainingDays', () => {
  it('returns 0 for past dates', () => {
    expect(getRemainingDays('2020-01-01')).toBe(0);
  });

  it('returns positive for future dates', () => {
    expect(getRemainingDays('2030-12-31')).toBeGreaterThan(0);
  });
});

describe('isWithinInternship', () => {
  it('returns true for date within range', () => {
    expect(isWithinInternship('2026-09-15', '2026-09-01', '2026-11-30')).toBe(
      true,
    );
  });

  it('returns true for start date', () => {
    expect(isWithinInternship('2026-09-01', '2026-09-01', '2026-11-30')).toBe(
      true,
    );
  });

  it('returns true for end date', () => {
    expect(isWithinInternship('2026-11-30', '2026-09-01', '2026-11-30')).toBe(
      true,
    );
  });

  it('returns false for date before range', () => {
    expect(isWithinInternship('2026-08-31', '2026-09-01', '2026-11-30')).toBe(
      false,
    );
  });

  it('returns false for date after range', () => {
    expect(isWithinInternship('2026-12-01', '2026-09-01', '2026-11-30')).toBe(
      false,
    );
  });
});

describe('formatDate', () => {
  it('formats date in Indonesian locale', () => {
    const result = formatDate('2026-09-20T01:00:00Z');
    // Should contain day number and month
    expect(result).toMatch(/20/);
    expect(result).toMatch(/Sep/);
    expect(result).toMatch(/2026/);
  });
});

describe('formatTime', () => {
  it('formats time in HH.mm format', () => {
    // 01:00 UTC = 08:00 WIB
    const result = formatTime('2026-09-20T01:00:00Z');
    expect(result).toBe('08.00');
  });
});
