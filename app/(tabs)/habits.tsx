import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useHabits } from '@/contexts/HabitContext'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { IconButton } from 'react-native-paper';

export default function HabitsScreen() {
  const { habits, addHabit, deleteHabit } = useHabits(); 
  const [newHabitText, setNewHabitText] = useState(''); 
  const textInputRef = useRef<TextInput>(null);
  const route = useRoute<RouteProp<RootStackParamList, 'habits'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'habits'>>();

  useFocusEffect(
    useCallback(() => {
      if (route.params?.focusInput) {
        textInputRef.current?.focus();
        navigation.setParams({ focusInput: false });
      }
    }, [route.params])
  );

  const handleAddHabit = () => {
    if (newHabitText.trim()) {
      addHabit({ name: newHabitText.trim() }); 
      setNewHabitText(''); 
    }
  };

  const handleDeleteHabit = (habitId: number) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>Manage Habits</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new habit..."
          value={newHabitText}
          onChangeText={setNewHabitText}
          onSubmitEditing={handleAddHabit}
          ref={textInputRef}
          blurOnSubmit={false} 
          placeholderTextColor="#888" 
        />
        <TouchableOpacity style={styles.button} onPress={handleAddHabit}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {habits.map(habit => (
        <ThemedView key={habit.id} style={styles.habitContainer}>
          <Text style={styles.habitText}>{habit.name}</Text>
          <IconButton
            icon="delete"
            size={24}
            onPress={() => handleDeleteHabit(habit.id!)}
          />
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, 
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    color: '#fff', 
    backgroundColor: '#333' 
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    margin: 16,
    borderRadius: 10,
  },
  habitText: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
});
