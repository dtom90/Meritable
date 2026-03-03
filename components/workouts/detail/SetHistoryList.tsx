import { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/common/Spinner';
import { SetRow } from './SetRow';
import { EditSetModal } from './EditSetModal';
import { getToday } from '@/lib/dateUtils';
import type { Set } from '@/db/types';

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

/** Volume for Max Volume comparison: treat missing weight as 1 lb. */
function volumeForMax(s: Set): number {
  const effectiveWeight = s.weight != null && s.weight > 0 ? s.weight : 1;
  return effectiveWeight * s.reps;
}

function getMaxVolumeSetIds(sets: Set[]): number[] {
  if (sets.length === 0) return [];
  let maxVolume = -1;
  const maxVolumeSetIds: number[] = [];
  for (const s of sets) {
    const vol = volumeForMax(s);
    if (vol > maxVolume) {
      maxVolume = vol;
      maxVolumeSetIds.length = 0;
      maxVolumeSetIds.push(s.id);
    } else if (vol === maxVolume) {
      maxVolumeSetIds.push(s.id);
    }
  }
  return maxVolumeSetIds;
}

function getMaxWeightSetIds(sets: Set[]): number[] {
  const withWeight = sets.filter((s) => s.weight != null && s.weight > 0);
  if (withWeight.length === 0) return [];
  const maxWeight = Math.max(...withWeight.map((s) => s.weight!));
  const atMaxWeight = withWeight.filter((s) => s.weight === maxWeight);
  const maxRepsAtMaxWeight = Math.max(...atMaxWeight.map((s) => s.reps));
  return atMaxWeight
    .filter((s) => s.reps === maxRepsAtMaxWeight)
    .map((s) => s.id);
}

export function SetHistoryList({ sets, isLoading }: SetHistoryListProps) {
  const byDate = useMemo(() => groupSetsByDate(sets), [sets]);
  const maxVolumeSetIds = useMemo(() => getMaxVolumeSetIds(sets), [sets]);
  const maxWeightSetIds = useMemo(() => getMaxWeightSetIds(sets), [sets]);
  const [editingSet, setEditingSet] = useState<Set | null>(null);

  return (
    <>
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
                    <SetRow
                      key={s.id}
                      set={s}
                      isMaxVolume={maxVolumeSetIds.includes(s.id)}
                      isMaxWeight={maxWeightSetIds.includes(s.id)}
                      onPress={(set) => setEditingSet(set)}
                    />
                  ))}
                </View>
              </View>
          ))}
        </View>
      )}
      <EditSetModal
        visible={editingSet != null}
        set={editingSet}
        onClose={() => setEditingSet(null)}
      />
    </>
  );
}
