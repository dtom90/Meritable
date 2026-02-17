import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import type { Reminder } from 'expo-calendar';
import { endOfDay } from '@/lib/dateUtils';

const QUICK_WINS_REMINDERS_QUERY_KEY = 'quickWinsReminders';

/**
 * Normalize a date value (Date or ISO string) to YYYY-MM-DD for comparison.
 */
function toDateString(value: string | Date | undefined): string | null {
  if (value == null) return null;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('sv-SE');
}

/**
 * Fetch reminder calendars and then reminders in the given range.
 * Filter to:
 * - Incomplete reminders with due date on or before selectedDate
 * - Complete reminders with completionDate on selectedDate
 */
async function fetchQuickWinsReminders(selectedDate: string): Promise<Reminder[]> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
  const calendarIds = calendars.map((c) => c.id).filter(Boolean);
  if (calendarIds.length === 0) return [];

  // Wide range: from long ago to end of selected day so we get past-due and completed-on-day
  const start = new Date(0); // epoch
  const end = endOfDay(selectedDate);

  const raw = await Calendar.getRemindersAsync(
    calendarIds as (string | null)[],
    null,
    start,
    end
  );

  const selected = selectedDate;

  return raw.filter((r) => {
    const dueStr = toDateString(r.dueDate);
    const completionStr = toDateString(r.completionDate);

    // Incomplete: due date on or before the selected date
    const incompleteDueOnOrBefore =
      r.completed !== true && dueStr != null && dueStr <= selected;
    // Complete: completed on the selected date
    const completeOnSelected =
      r.completed === true && completionStr != null && completionStr === selected;

    return incompleteDueOnOrBefore || completeOnSelected;
  });
}

/**
 * Permission hook for Reminders (iOS). Re-export from expo-calendar for use in Quick Wins screen.
 */
export const useRemindersPermissions = Calendar.useRemindersPermissions;

/**
 * React Query hook for Quick Wins reminders for a given date.
 * Only runs on iOS when Reminders permission is granted.
 */
export function useQuickWinsReminders(selectedDate: string, permissionGranted: boolean) {
  const queryClient = useQueryClient();
  const enabled = Platform.OS === 'ios' && permissionGranted;

  const query = useQuery({
    queryKey: [QUICK_WINS_REMINDERS_QUERY_KEY, selectedDate],
    queryFn: () => fetchQuickWinsReminders(selectedDate),
    enabled,
  });

  return {
    ...query,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: [QUICK_WINS_REMINDERS_QUERY_KEY] }),
  };
}

/**
 * Query key for invalidating Quick Wins reminders (e.g. on AppState foreground).
 */
export const quickWinsRemindersQueryKey = [QUICK_WINS_REMINDERS_QUERY_KEY];
