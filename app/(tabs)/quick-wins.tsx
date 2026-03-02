import { View, Text, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/common/WeekHeader';
import { NarrowView } from '@/components/common/NarrowView';
import { useRemindersPermissions } from '@/db/useReminders';
import OpenRemindersLink from '@/components/quick-wins/OpenRemindersLink';
import RemindersPermissionBanner from '@/components/quick-wins/RemindersPermissionBanner';
import RemindersContent from '@/components/quick-wins/RemindersContent';

export default function QuickWinsScreen() {
  const [permission] = useRemindersPermissions();
  const permissionGranted = permission?.granted === true;

  if (Platform.OS !== 'ios') {
    return (
      <>
        <WeekHeader />
        <NarrowView disableScroll>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>
              Quick Wins is available on iOS.
            </Text>
          </View>
        </NarrowView>
      </>
    );
  }

  return (
    <>
      <WeekHeader />
      <NarrowView>
        {permissionGranted && <OpenRemindersLink />}
        {!permissionGranted && <RemindersPermissionBanner />}
        {permissionGranted && <RemindersContent />}
      </NarrowView>
    </>
  );
}
