import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
 * Only reminders with a due date are shown. Of those:
 * - Incomplete: due date on or before selectedDate
 * - Complete: completionDate on selectedDate
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

    // Only show reminders that have a due date
    if (dueStr == null) return false;

    // Incomplete: due date on or before the selected date
    const incompleteDueOnOrBefore = r.completed !== true && dueStr <= selected;
    // Complete: completed on the selected date
    const completeOnSelected =
      r.completed === true && completionStr != null && completionStr === selected;

    return incompleteDueOnOrBefore || completeOnSelected;
  });
}

/**
 * Update a reminder's completion state. Uses current time for completionDate when completing.
 * Fetches the full reminder first and passes it back with only completed/completionDate changed,
 * so no other fields (e.g. title) are cleared. iOS only; no-op on other platforms.
 */
async function updateReminderCompletionAsync(
  reminderId: string,
  completed: boolean
): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const reminder = await Calendar.getReminderAsync(reminderId);
  const { creationDate, lastModifiedDate, ...rest } = reminder;
  const base = { ...rest, id: reminderId };
  if (completed) {
    await Calendar.updateReminderAsync(reminderId, {
      ...base,
      completed: true,
      completionDate: new Date(),
    });
  } else {
    await Calendar.updateReminderAsync(reminderId, {
      ...base,
      completed: false,
      completionDate: null as unknown as Reminder['completionDate'],
    });
  }
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

/**
 * Mutation hook to mark a reminder complete or incomplete. Uses current time for completionDate when completing.
 * Only runs on iOS; no-op on other platforms.
 */
export function useUpdateReminderCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reminderId,
      completed,
    }: {
      reminderId: string;
      completed: boolean;
    }) => {
      await updateReminderCompletionAsync(reminderId, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUICK_WINS_REMINDERS_QUERY_KEY] });
    },
  });
}
