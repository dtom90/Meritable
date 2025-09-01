import { Stack } from 'expo-router';
import React from 'react';

export default function HabitsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[habitId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
