import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import { BackButton } from '@/components/common/BackButton';

type ExerciseDetailHeaderProps = {
  title: string;
};

export function ExerciseDetailHeader({ title }: ExerciseDetailHeaderProps) {
  return (
    <View className="flex-row items-center mb-6">
      <BackButton />
      <Text
        className="flex-1 text-2xl font-bold text-center"
        style={{ color: Colors.text }}
      >
        {title}
      </Text>
      <View style={{ width: 32 }} />
    </View>
  );
}
