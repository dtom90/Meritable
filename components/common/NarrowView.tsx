import { Colors } from '@/lib/Colors';
import { RefreshControl, ScrollView, View } from 'react-native';

export function NarrowView({
  children,
  disableScroll = false,
  refreshing,
  onRefresh,
}: {
  children: React.ReactNode;
  disableScroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  return (
    <View className="flex-1 w-full items-center" style={{ backgroundColor: Colors.background }}>
      <View className='max-w-3xl w-full p-4 flex-1'>
        {disableScroll ? (
          <View className="flex-1">
            {children}
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                  tintColor={Colors.primary}
                  colors={[Colors.primary]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
