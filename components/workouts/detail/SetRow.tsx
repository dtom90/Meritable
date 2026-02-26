import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Set } from '@/db/habitDatabase';

function formatSetRow(s: Set): string {
  if (s.weight != null && s.weight > 0) {
    return `${s.weight} lbs × ${s.reps}`;
  }
  return `${s.reps} reps`;
}

type SetRowProps = {
  set: Set;
};

export function SetRow({ set }: SetRowProps) {
  return (
    <View
      className="p-3 rounded flex-row justify-between items-center"
      style={{ backgroundColor: Colors.card }}
    >
      <Text style={{ color: Colors.text }}>{formatSetRow(set)}</Text>
      {set.completionDate ? (
        <Text
          className="text-sm"
          style={{ color: Colors.textSecondary }}
        >
          {set.completionDate}
        </Text>
      ) : null}
    </View>
  );
}
