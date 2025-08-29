import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListHabits, useListHabitCompletions, useCreateHabitCompletion, useDeleteHabitCompletion, useUpdateHabit } from '@/db/useHabitDb';
import { Icon } from 'react-native-paper';

export default function HabitDetail() {
  const { habitId } = useLocalSearchParams();
  const router = useRouter();
  const { data: habits = [] } = useListHabits();
  
  // Find the current habit
  const habit = habits.find(h => h.id === Number(habitId));
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get habit completions for today
  const { data: completedHabitIds = [] } = useListHabitCompletions(today);
  const isCompletedToday = completedHabitIds.includes(Number(habitId));
  
  // Mutations for tracking completions
  const createCompletionMutation = useCreateHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();

  // State for editing habit name
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit?.name || '');
  
  // Mutation for updating habit
  const updateHabitMutation = useUpdateHabit();

  useFocusEffect(
    useCallback(() => {
      // Refresh data when the page comes into focus
    }, [])
  );

  const handleToggleCompletion = () => {
    if (isCompletedToday) {
      deleteCompletionMutation.mutate({ habitId: Number(habitId), completionDate: today });
    } else {
      createCompletionMutation.mutate({ habitId: Number(habitId), completionDate: today });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (habit) {
      setEditName(habit.name);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      // Don't save empty names
      setIsEditing(false);
      setEditName('');
      return;
    }
    
    if (trimmedName.length > 100) {
      // Limit habit name to 100 characters
      console.error('Habit name too long');
      return;
    }
    
    if (trimmedName !== habit?.name) {
      try {
        await updateHabitMutation.mutateAsync({ 
          id: Number(habitId), 
          updates: { name: trimmedName } 
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update habit:', error);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
  };

  if (!habit) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
        <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text style={{ color: Colors.text }}>Habit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-[50px] px-5 max-w-[800px] self-center w-full">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={handleBack} className="mr-4">
              <Icon source="arrow-left" color={Colors.text} size={24} />
            </TouchableOpacity>
            
            {isEditing ? (
              <View className="flex-1">
                <View className="flex-row items-center">
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="flex-1 text-2xl font-bold mr-3"
                    style={{ color: Colors.text }}
                    placeholder="Enter habit name"
                    placeholderTextColor={Colors.textSecondary}
                    autoFocus
                    onSubmitEditing={handleSave}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity 
                    onPress={handleSave}
                    disabled={updateHabitMutation.isPending || !editName.trim() || editName.trim().length > 100 || editName.trim() === habit.name}
                    className="mr-2 p-2 rounded-lg"
                    style={{ 
                      backgroundColor: (!editName.trim() || editName.trim().length > 100 || editName.trim() === habit.name) 
                        ? Colors.textTertiary 
                        : Colors.primary 
                    }}
                  >
                    {updateHabitMutation.isPending ? (
                      <Icon source="loading" color="white" size={20} />
                    ) : (
                      <Icon source="check" color="white" size={20} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCancel}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: Colors.surface }}
                  >
                    <Icon source="close" color={Colors.text} size={20} />
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between items-center mt-1">
                  <Text 
                    className="text-sm" 
                    style={{ color: editName.length > 100 ? Colors.error || '#ef4444' : Colors.textSecondary }}
                  >
                    {editName.length}/100 characters
                  </Text>
                  {editName.length > 100 && (
                    <Text className="text-sm text-red-500">
                      Name too long
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-1 flex-row items-center">
                <Text className="text-2xl font-bold flex-1" style={{ color: Colors.text }}>
                  {habit.name}
                </Text>
                <TouchableOpacity 
                  onPress={handleEdit}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: Colors.surface }}
                >
                  <Icon source="pencil" color={Colors.primary} size={20} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Habit Info Card */}
          <View className="p-6 rounded-lg mb-6" style={{ backgroundColor: Colors.surface }}>
            <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
              Habit Details
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text style={{ color: Colors.textSecondary }}>Created:</Text>
                <Text style={{ color: Colors.text }}>
                  {habit.created_at ? new Date(habit.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text style={{ color: Colors.textSecondary }}>Last Updated:</Text>
                <Text style={{ color: Colors.text }}>
                  {habit.updated_at ? new Date(habit.updated_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Tracking */}
          <View className="p-6 rounded-lg mb-6" style={{ backgroundColor: Colors.surface }}>
            <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
              Today's Progress
            </Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Icon 
                  source={isCompletedToday ? "check-circle" : "circle-outline"} 
                  color={isCompletedToday ? Colors.primary : Colors.textSecondary} 
                  size={32} 
                />
                <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
                  {isCompletedToday ? 'Completed' : 'Not completed'}
                </Text>
              </View>
              
              <TouchableOpacity
                className={`py-3 px-6 rounded-lg ${isCompletedToday ? 'bg-red-500' : 'bg-green-500'}`}
                onPress={handleToggleCompletion}
                disabled={createCompletionMutation.isPending || deleteCompletionMutation.isPending}
              >
                <Text className="text-white font-semibold">
                  {isCompletedToday ? 'Mark Incomplete' : 'Mark Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="p-6 rounded-lg" style={{ backgroundColor: Colors.surface }}>
            <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
              Quick Actions
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity 
                className="flex-row items-center p-4 rounded-lg"
                style={{ backgroundColor: Colors.card }}
                onPress={() => router.push('/(tabs)')}
              >
                <Icon source="clock" color={Colors.primary} size={24} />
                <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
                  Track All Habits
                </Text>
                <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center p-4 rounded-lg"
                style={{ backgroundColor: Colors.card }}
                onPress={() => router.push('/(tabs)/habits')}
              >
                <Icon source="settings" color={Colors.primary} size={24} />
                <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
                  Manage Habits
                </Text>
                <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
