import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from 'react-native-paper';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View className="flex-1 self-center w-full">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 0,
              backgroundColor: 'transparent',
            },
            android: {
              elevation: 0,
              backgroundColor: Colors[colorScheme ?? 'light'].background,
            },
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Track',
            tabBarIcon: ({ color }) => <Icon source="clock" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
