import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import type { Reminder } from 'expo-calendar';
import { endOfDay, getToday, noonOnDate, toDateString } from '@/lib/dateUtils';

const QUICK_WINS_REMINDERS_QUERY_KEY = 'quickWinsReminders';

/**
 * Fetch reminder calendars and then reminders in the given range.
 * Only reminders with a due date are shown. Incomplete reminders by selected date:
 * - Previous days: overdue only (due before selected date)
 * - Current date: overdue and due today
 * - Future days: due on selected date only
 * Complete: always show when completionDate is on selected date.
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
  const todayStr = getToday();

  return raw.filter((r) => {
    const dueStr = toDateString(r.dueDate);
    const completionStr = toDateString(r.completionDate);

    // Only show reminders that have a due date
    if (dueStr == null) return false;

    // Complete: completed on the selected date
    const completeOnSelected =
      r.completed === true && completionStr != null && completionStr === selected;
    if (completeOnSelected) return true;

    // Incomplete: filter by relationship of selected date to today
    if (r.completed === true) return false;
    if (selected < todayStr) {
      // Previous days: overdue and due on selected date
      return dueStr <= selected;
    }
    if (selected === todayStr) {
      // Current date: overdue and due today
      return dueStr <= selected;
    }
    // Future: due on selected date only
    return dueStr === selected;
  });
}

/**
 * Update a reminder's completion state. When completing: uses current time if selectedDate is today,
 * otherwise 12:00 noon in local timezone on selectedDate. Fetches the full reminder first and
 * passes it back with only completed/completionDate changed. iOS only; no-op on other platforms.
 */
async function updateReminderCompletionAsync(
  reminderId: string,
  completed: boolean,
  selectedDate: string
): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const reminder = await Calendar.getReminderAsync(reminderId);
  const { creationDate, lastModifiedDate, ...rest } = reminder;
  const base = { ...rest, id: reminderId };
  if (completed) {
    const completionDate =
      selectedDate === getToday() ? new Date() : noonOnDate(selectedDate);
    await Calendar.updateReminderAsync(reminderId, {
      ...base,
      completed: true,
      completionDate,
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
 * React Query hook to fetch a single reminder by ID. Used on the quick-win detail page.
 */
export function useReminder(reminderId: string | undefined) {
  return useQuery({
    queryKey: ['reminder', reminderId],
    queryFn: () => Calendar.getReminderAsync(reminderId!),
    enabled: Platform.OS === 'ios' && Boolean(reminderId),
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
      selectedDate,
    }: {
      reminderId: string;
      completed: boolean;
      selectedDate: string;
    }) => {
      await updateReminderCompletionAsync(reminderId, completed, selectedDate);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUICK_WINS_REMINDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['reminder', variables.reminderId] });
    },
  });
}
