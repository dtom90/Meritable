import { Stack } from 'expo-router';
import React from 'react';

export default function QuickWinsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[reminderId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
