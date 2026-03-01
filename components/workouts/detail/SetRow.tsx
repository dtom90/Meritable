import { View, Text, Pressable } from 'react-native';
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
  onPress?: (set: Set) => void;
};

export function SetRow({ set, onPress }: SetRowProps) {
  const content = (
    <>
      <Text style={{ color: Colors.text }}>{formatSetRow(set)}</Text>
      {set.completionDate ? (
        <Text
          className="text-sm"
          style={{ color: Colors.textSecondary }}
        >
          {set.completionDate}
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => onPress(set)}
        className="p-3 rounded flex-row justify-between items-center active:opacity-80"
        style={{ backgroundColor: Colors.card }}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className="p-3 rounded flex-row justify-between items-center"
      style={{ backgroundColor: Colors.card }}
    >
      {content}
    </View>
  );
}
