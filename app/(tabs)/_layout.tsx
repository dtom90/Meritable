import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.surface }}>
      <View className="flex-1" style={{ backgroundColor: Colors.background }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textSecondary,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.surface,
              borderTopColor: Colors.border,
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 90 : 70,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              marginTop: 4,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="habits"
            options={{
              title: 'Habits',
              tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
              href: '/habits',
            }}
          />
          <Tabs.Screen
            name="quick-wins"
            options={{
              title: 'Quick Wins',
              tabBarIcon: ({ color }) => <Ionicons name="checkmark" size={28} color={color} />,
              href: '/quick-wins',
            }}
          />
          <Tabs.Screen
            name="data"
            options={{
              title: 'Data',
              tabBarIcon: ({ color }) => <Ionicons name="cloud-download" size={28} color={color} />,
              href: '/data',
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
