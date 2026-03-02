import { View, Text, Pressable } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useRemindersPermissions } from '@/db/useReminders';

export default function RemindersPermissionBanner() {
  const [permission, requestPermission] = useRemindersPermissions();

  if (!permission?.granted && permission?.canAskAgain !== false) {
    return (
      <View className="mb-4">
        <Text style={{ color: Colors.text, marginBottom: 8 }}>
          Grant access to Reminders to see your dated reminders for the selected day.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: Colors.primary, borderRadius: 8, alignSelf: 'flex-start' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Allow access</Text>
        </Pressable>
      </View>
    );
  }

  if (!permission?.granted && permission?.canAskAgain === false) {
    return (
      <Text style={{ color: Colors.textSecondary }}>
        Reminders access was denied. You can enable it in Settings.
      </Text>
    );
  }

  return null;
}
