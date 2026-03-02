import { Pressable, Text, Linking } from 'react-native';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';

export default function OpenRemindersLink() {
  return (
    <Pressable
      onPress={() => Linking.openURL('x-apple-reminderkit://')}
      className="flex-row items-center gap-2 py-2 mb-2"
      style={{ alignSelf: 'flex-start' }}
    >
      <Icon source="open-in-new" size={20} color={Colors.primary} />
      <Text style={{ color: Colors.primary, fontWeight: '500' }}>
        Open Reminders
      </Text>
    </Pressable>
  );
}
