import React from 'react';
import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: Colors.background }}>
        <Text className="text-3xl font-bold leading-8" style={{ color: Colors.text }}>This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="leading-[30px] text-base" style={{ color: Colors.primary }}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

