import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '@/lib/Colors';
import HabitInputForm from '@/components/HabitInputForm';
import HabitsList from '@/components/HabitsList';

export default function HabitManager() {

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text className="mb-5 text-center text-3xl font-bold leading-8" style={{ color: Colors.text }}>
            Manage Habits
          </Text>

          <HabitInputForm />

          <HabitsList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
