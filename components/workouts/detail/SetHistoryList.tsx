import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/Spinner';
import { SetRow } from './SetRow';
import { getToday } from '@/lib/dateUtils';
import type { Set } from '@/db/habitDatabase';

type SetHistoryListProps = {
  sets: Set[];
  isLoading: boolean;
};

function formatDateHeader(isoDate: string): string {
  if (isoDate === getToday()) return 'Today';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function groupSetsByDate(sets: Set[]): [string, Set[]][] {
  const byDate = new Map<string, Set[]>();
  for (const s of sets) {
    const d = s.completionDate ?? '';
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  }
  const sorted = [...byDate.entries()].sort(([a], [b]) => b.localeCompare(a));
  return sorted;
}

export function SetHistoryList({ sets, isLoading }: SetHistoryListProps) {
  const byDate = useMemo(() => groupSetsByDate(sets), [sets]);

  return (
    <>
      <Text className="text-base mb-2" style={{ color: Colors.textSecondary }}>
        History
      </Text>
      {isLoading ? (
        <Spinner />
      ) : sets.length === 0 ? (
        <Text style={{ color: Colors.textSecondary }}>
          No sets yet. Add one above.
        </Text>
      ) : (
        <View className="gap-4">
          {byDate.map(([date, dateSets]) => (
            <View key={date} className="gap-2">
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.textSecondary }}
              >
                {formatDateHeader(date)}
              </Text>
              <View className="gap-2">
                {dateSets.map((s) => (
                  <SetRow key={s.id} set={s} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}
