import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import {
  format as dateFnsFormat,
  differenceInMinutes,
  differenceInCalendarDays,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
  startOfMonth as dateFnsStartOfMonth,
  endOfMonth as dateFnsEndOfMonth,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/** Default timezone for display per Architecture.md §4.7 */
export const TIMEZONE = 'Asia/Jakarta';

/**
 * Format a UTC date to Asia/Jakarta display format.
 * Examples:
 *   formatDate(date) → "20 Sep 2026"
 *   formatDate(date, 'dd MMMM yyyy') → "20 September 2026"
 */
export function formatDate(
  date: Date | string,
  pattern = 'd MMM yyyy',
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, TIMEZONE, pattern, { locale: idLocale });
}

/**
 * Format a UTC timestamp to Asia/Jakarta time.
 * Example: formatTime(date) → "08.00"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, TIMEZONE, 'HH.mm', { locale: idLocale });
}

/**
 * Format a UTC timestamp to Asia/Jakarta date and time.
 * Example: formatDateTime(date) → "20 Sep 2026 08.00"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, TIMEZONE, 'd MMM yyyy HH.mm', {
    locale: idLocale,
  });
}

/**
 * Format duration in minutes to human-readable Indonesian format.
 * Example: formatDuration(450) → "7j 30m"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}j`;
  return `${hours}j ${minutes}m`;
}

/**
 * Calculate worked minutes from check-in, check-out, and break.
 * Returns 0 if check-in or check-out is missing.
 */
export function calculateWorkedMinutes(
  checkIn: Date | null,
  checkOut: Date | null,
  breakMinutes: number = 0,
): number {
  if (!checkIn || !checkOut) return 0;
  const total = differenceInMinutes(checkOut, checkIn);
  return Math.max(0, total - breakMinutes);
}

/**
 * Get the current date in Asia/Jakarta timezone as a Date object.
 * NOTE: Only use this for local calendar calculations (e.g. differenceInCalendarDays).
 * NEVER call .toISOString() on this object to store in databases, because toZonedTime
 * shifts the internal epoch time to Jakarta wall-clock time; .toISOString() will
 * format the shifted time with 'Z', causing a +7h bug in timestamptz columns!
 * For UTC timestamps to store in the database, always use new Date().toISOString().
 */
export function nowInJakarta(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Get today's date string in Asia/Jakarta timezone (YYYY-MM-DD).
 */
export function todayInJakarta(): string {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Calculate internship day number (1-based).
 */
export function getInternshipDay(startDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const now = nowInJakarta();
  return Math.max(1, differenceInCalendarDays(now, start) + 1);
}

/**
 * Calculate internship week number (1-based).
 */
export function getInternshipWeek(startDate: Date | string): number {
  return Math.ceil(getInternshipDay(startDate) / 7);
}

/**
 * Calculate remaining days in internship.
 */
export function getRemainingDays(endDate: Date | string): number {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const now = nowInJakarta();
  return Math.max(0, differenceInCalendarDays(end, now));
}

/**
 * Check if a date falls within the internship period.
 */
export function isWithinInternship(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string,
): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return (isAfter(d, start) || isEqual(d, start)) && (isBefore(d, end) || isEqual(d, end));
}

// Re-exports for convenience
export {
  dateFnsFormat as format,
  dateFnsStartOfWeek as startOfWeek,
  dateFnsEndOfWeek as endOfWeek,
  dateFnsStartOfMonth as startOfMonth,
  dateFnsEndOfMonth as endOfMonth,
  differenceInMinutes,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  parseISO,
};
