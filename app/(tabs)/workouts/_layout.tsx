import { Stack } from 'expo-router';
import React from 'react';

export default function WorkoutsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[exerciseId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
