import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/lib/Colors';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export default function Spinner({ size = 'large', color = Colors.primary }: SpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
