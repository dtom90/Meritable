import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useListHabits } from '@/db/useHabitDb';
import HabitInputForm from '@/components/HabitInputForm';
import HabitItem from '@/components/HabitItem';

export default function HabitManager() {
  const { data: habits = [], isLoading } = useListHabits();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
        <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text style={{ color: Colors.text }}>Loading habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-[50px] px-5 max-w-[800px] self-center w-full">

          <Text className="mb-5 text-center text-3xl font-bold leading-8" style={{ color: Colors.text }}>Manage Habits</Text>

          <HabitInputForm />

          {habits.map(habit => (
            <HabitItem key={habit.id} habit={habit} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

