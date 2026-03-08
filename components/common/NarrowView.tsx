import { useEffect, useState } from 'react';
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
  // Workaround for iOS New Architecture: tintColor is not applied until after a delay (react-native#53987)
  const [refreshColor, setRefreshColor] = useState<string | undefined>(undefined);
  useEffect(() => {
    const t = setTimeout(() => setRefreshColor(Colors.primary), 500);
    return () => clearTimeout(t);
  }, []);

  const contentPadding = 16; // same as p-4, applied as scroll content padding to avoid gap at header/tabs

  return (
    <View className="flex-1 w-full items-center" style={{ backgroundColor: Colors.background }}>
      <View
        className="max-w-3xl w-full flex-1"
        style={
          disableScroll
            ? {
                paddingHorizontal: contentPadding,
                paddingTop: contentPadding,
              }
            : undefined
        }
      >
        {disableScroll ? (
          <View className="flex-1">
            {children}
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: contentPadding,
              paddingTop: contentPadding,
              paddingBottom: contentPadding,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                  tintColor={refreshColor}
                  colors={refreshColor ? [refreshColor] : undefined}
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
