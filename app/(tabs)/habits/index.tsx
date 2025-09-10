import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import HabitInputForm from '@/components/HabitInputForm';
import HabitsListWeb from '@/components/HabitsListWeb';
import HabitsListMobile from '@/components/HabitsListMobile';

export default function HabitManager() {

  const ContentWrapper = Platform.OS === 'web' ? ScrollView : View;
  
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ContentWrapper 
        className="flex-1" 
        {...(Platform.OS === 'web' && { 
          showsVerticalScrollIndicator: false, 
          contentContainerStyle: { flexGrow: 1 } 
        })}
      >
        <View className="pt-[50px] px-5 max-w-[800px] self-center w-full flex-1">
          <Text className="mb-5 text-center text-3xl font-bold leading-8" style={{ color: Colors.text }}>
            Manage Habits
          </Text>

          <HabitInputForm />

          {
            Platform.OS === 'web' 
              ? (
                <HabitsListWeb />
              ) 
              : (
                <HabitsListMobile />
              )
          }
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
}
