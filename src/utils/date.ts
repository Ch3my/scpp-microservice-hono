import { DateTime } from 'luxon';

/**
 * Format a JavaScript Date to yyyy-MM-dd string in UTC
 * Matches old-app behavior: converts to UTC to avoid timezone issues
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  if (typeof date === 'string') {
    return DateTime.fromISO(date).toUTC().toFormat('yyyy-MM-dd');
  }
  return DateTime.fromJSDate(date).toUTC().toFormat('yyyy-MM-dd');
}

/**
 * Format a JavaScript Date to yyyy-MM-dd HH:mm:ss string
 * Used for datetime fields
 */
export function formatDateTimeToSQL(date: Date | string): string {
  if (typeof date === 'string') {
    return DateTime.fromISO(date).toFormat('yyyy-MM-dd HH:mm:ss');
  }
  return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd HH:mm:ss');
}

/**
 * Get current date in yyyy-MM-dd format
 */
export function getCurrentDate(): string {
  return DateTime.now().toFormat('yyyy-MM-dd');
}

/**
 * Get current datetime in yyyy-MM-dd HH:mm:ss format
 */
export function getCurrentDateTime(): string {
  return DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
}

/**
 * Get the first day of a month N months ago
 */
export function getFirstDayOfMonthAgo(months: number): string {
  return DateTime.now().minus({ months }).toFormat('yyyy-MM-') + '01';
}

/**
 * Get the last day of the current month
 */
export function getLastDayOfCurrentMonth(): string {
  const now = DateTime.now();
  return now.toFormat('yyyy-MM-') + now.daysInMonth;
}

/**
 * Get current year-month label (yyyy-MM)
 */
export function getCurrentYearMonth(): string {
  return DateTime.now().toFormat('yyyy-MM');
}

/**
 * Get year-month label N months ago
 */
export function getYearMonthAgo(months: number): string {
  return DateTime.now().minus({ months }).toFormat('yyyy-MM');
}

/**
 * Generate array of year-month labels for the past N months
 */
export function generateMonthLabels(nMonths: number): string[] {
  const labels: string[] = [];
  for (let i = nMonths - 1; i >= 0; i--) {
    labels.push(DateTime.now().minus({ months: i }).toFormat('yyyy-MM'));
  }
  return labels;
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return DateTime.now().year;
}
