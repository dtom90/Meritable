import { HabitCompletion } from '@/db/types';
import { getToday, isValidDateFormat } from '@/lib/dateUtils';

export type DailyCountPoint = {
  date: string;
  count: number;
};

/**
 * Parse YYYY-MM-DD as a local calendar date.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date as YYYY-MM-DD in local time.
 */
export function formatLocalDate(date: Date): string {
  return date.toLocaleDateString('sv-SE');
}

/**
 * Add (or subtract) days from a YYYY-MM-DD string, returning YYYY-MM-DD.
 */
export function addDays(dateString: string, days: number): string {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Build a contiguous daily series of counts ending on `endDate` (inclusive).
 * Missing days are filled with 0. Multiple completions on the same day are summed.
 */
export function buildDailyCountSeries(
  completions: HabitCompletion[],
  options?: { endDate?: string; dayCount?: number }
): DailyCountPoint[] {
  const endDate = options?.endDate ?? getToday();
  const dayCount = options?.dayCount ?? 15;

  if (!isValidDateFormat(endDate) || dayCount <= 0) {
    return [];
  }

  const countsByDate = new Map<string, number>();
  for (const completion of completions) {
    if (!isValidDateFormat(completion.completionDate)) continue;
    const count = completion.count ?? 0;
    countsByDate.set(
      completion.completionDate,
      (countsByDate.get(completion.completionDate) ?? 0) + count
    );
  }

  const startDate = addDays(endDate, -(dayCount - 1));
  const series: DailyCountPoint[] = [];

  for (let i = 0; i < dayCount; i++) {
    const date = addDays(startDate, i);
    series.push({
      date,
      count: countsByDate.get(date) ?? 0,
    });
  }

  return series;
}

/**
 * Y-axis max for the chart: at least the target (if any), the peak count, and 1.
 */
export function getChartYMax(series: DailyCountPoint[], countTarget?: number | null): number {
  const peak = series.reduce((max, point) => Math.max(max, point.count), 0);
  const target = countTarget != null && countTarget > 0 ? countTarget : 0;
  return Math.max(peak, target, 1);
}

/**
 * Short label for chart x-axis (e.g. "Mar 2").
 * Uses local calendar parts so labels stay correct across timezones.
 */
export function formatChartDateLabel(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Evenly spaced x-axis label indexes for a series of `pointCount` points.
 * Always includes the first and last point when possible.
 */
export function getChartXLabelIndexes(pointCount: number, labelCount = 4): number[] {
  if (pointCount <= 0) return [];
  if (pointCount === 1) return [0];

  const desired = Math.max(2, Math.min(labelCount, pointCount));
  const indexes: number[] = [];

  for (let i = 0; i < desired; i++) {
    const index = Math.round((i * (pointCount - 1)) / (desired - 1));
    if (indexes[indexes.length - 1] !== index) {
      indexes.push(index);
    }
  }

  return indexes;
}

export function getChartXLabelAnchor(
  index: number,
  pointCount: number
): 'start' | 'middle' | 'end' {
  if (index === 0) return 'start';
  if (index === pointCount - 1) return 'end';
  return 'middle';
}
