import { View, Text, Pressable } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Set } from '@/db/types';

function formatSetRow(s: Set): string {
  if (s.weight != null && s.weight > 0) {
    return `${s.weight} lbs × ${s.reps}`;
  }
  return `${s.reps} reps`;
}

type SetRowProps = {
  set: Set;
  isMaxVolume?: boolean;
  isMaxWeight?: boolean;
  onPress?: (set: Set) => void;
};

export function SetRow({ set, isMaxVolume = false, isMaxWeight = false, onPress }: SetRowProps) {
  const content = (
    <>
      <View className="flex-row items-center gap-2 flex-1 flex-wrap">
        <Text style={{ color: Colors.text }}>{formatSetRow(set)}</Text>
        {isMaxVolume ? (
          <Text
            className="text-xs font-medium"
            style={{ color: Colors.success }}
          >
            Max Volume
          </Text>
        ) : null}
        {isMaxWeight ? (
          <Text
            className="text-xs font-medium"
            style={{ color: Colors.success }}
          >
            Max Weight
          </Text>
        ) : null}
      </View>
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

  const isHighlighted = isMaxVolume || isMaxWeight;
  const containerStyle = {
    backgroundColor: isHighlighted ? 'rgba(52, 199, 89, 0.15)' : Colors.card,
    borderLeftWidth: isHighlighted ? 3 : 0,
    borderLeftColor: isHighlighted ? Colors.success : 'transparent',
  };

  if (onPress) {
    return (
      <Pressable
        onPress={() => onPress(set)}
        className="p-3 rounded flex-row justify-between items-center active:opacity-80"
        style={containerStyle}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className="p-3 rounded flex-row justify-between items-center"
      style={containerStyle}
    >
      {content}
    </View>
  );
}
