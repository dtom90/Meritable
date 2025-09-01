import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
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
            // paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            // paddingTop: 10,
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
            title: 'Track',
            tabBarIcon: ({ color }) => <Icon source="clock" size={28} color={color} />,
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
          name="data"
          options={{
            title: 'Data',
            tabBarIcon: ({ color }) => <Ionicons name="cloud-download" size={28} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
