import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/Spinner';
import { SetRow } from './SetRow';
import type { Set } from '@/db/habitDatabase';

type SetHistoryListProps = {
  sets: Set[];
  isLoading: boolean;
};

export function SetHistoryList({ sets, isLoading }: SetHistoryListProps) {
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
        <View className="gap-2">
          {sets.map((s) => (
            <SetRow key={s.id} set={s} />
          ))}
        </View>
      )}
    </>
  );
}
