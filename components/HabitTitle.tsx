import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useUpdateHabit } from '@/db/useHabitDb';
import { Habit } from '@/db/types';


const maxNameLength = 100

export default function HabitTitle({ habit }: { habit: Habit }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit?.name || '');
  
  const updateHabitMutation = useUpdateHabit();

  const handleEdit = useCallback(() => {
    if (habit) {
      setEditName(habit.name);
      setIsEditing(true);
    }
  }, [habit]);

  const handleSave = useCallback(async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      // Don't save empty names
      setIsEditing(false);
      setEditName('');
      return;
    }
    
    if (trimmedName.length > maxNameLength) {
      console.error('Habit name too long');
      return;
    }
    
    if (trimmedName !== habit?.name) {
      try {
        await updateHabitMutation.mutateAsync({ 
          id: Number(habit.id), 
          updates: { name: trimmedName } 
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update habit:', error);
      }
    } else {
      setIsEditing(false);
    }
  }, [habit, editName, setEditName, setIsEditing]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditName('');
  }, [setIsEditing, setEditName]);


  return (
    <View className="flex-row items-center mb-6">
      <TouchableOpacity onPress={() => router.push('/(tabs)/habits')} className="mr-4">
        <Icon source="arrow-left" color={Colors.text} size={24} />
      </TouchableOpacity>
      
      {isEditing ? (
        <View className="flex-1">
          <View className="flex-row items-center">
            <TextInput
              value={editName}
              onChangeText={setEditName}
              onBlur={handleSave}
              className="flex-1 text-2xl font-bold text-center mx-3"
              style={{ color: Colors.text }}
              placeholder="Enter habit name"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              onSubmitEditing={handleSave}
              returnKeyType="done"
            />
            <TouchableOpacity 
              onPress={handleSave}
              disabled={updateHabitMutation.isPending || !editName.trim() || editName.trim().length > maxNameLength || editName.trim() === habit.name}
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: (!editName.trim() || editName.trim().length > maxNameLength || editName.trim() === habit.name) 
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
          </View>
          {editName.length > maxNameLength && (
            <View className="flex-row justify-between items-center mt-1">
              <Text 
                className="text-sm" 
                style={{ color: editName.length > maxNameLength ? Colors.error || '#ef4444' : Colors.textSecondary }}
              >
                {editName.length}/{maxNameLength} characters
              </Text>
              <Text className="text-sm text-red-500">
                Name too long
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 flex-row items-center">
          <Text 
            onPress={handleEdit}
            className="text-2xl font-bold text-center flex-1"
            style={{ color: Colors.text }}
          >
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
  )
}
