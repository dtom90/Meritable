import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';

type ExerciseDetailHeaderProps = {
  title: string;
};

export function ExerciseDetailHeader({ title }: ExerciseDetailHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center mb-6">
      <TouchableOpacity onPress={() => router.back()} className="mr-4">
        <Icon source="arrow-left" color={Colors.text} size={24} />
      </TouchableOpacity>
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
