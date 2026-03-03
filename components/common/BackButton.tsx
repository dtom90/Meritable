import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';

type BackButtonProps = {
  onPress?: () => void;
  className?: string;
};

export function BackButton({ onPress, className = 'mr-4' }: BackButtonProps) {
  const router = useRouter();
  const handlePress = onPress ?? (() => router.back());

  return (
    <TouchableOpacity onPress={handlePress} className={className}>
      <Icon source="arrow-left" color={Colors.text} size={24} />
    </TouchableOpacity>
  );
}
