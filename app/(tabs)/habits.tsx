import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const addHabit = () => {
    if (newHabit.trim() === '') return;
    setHabits([...habits, { id: Date.now().toString(), text: newHabit, completed: false }]);
    setNewHabit('');
  };

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map(habit =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const removeHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const renderItem = ({ item }: { item: Habit }) => (
    <View style={styles.habitItem}>
      <TouchableOpacity onPress={() => toggleHabit(item.id)} style={styles.habitTextContainer}>
        <ThemedText style={[styles.habitText, item.completed && styles.completedText]}>
          {item.text}
        </ThemedText>
      </TouchableOpacity>
      <Button title="Remove" onPress={() => removeHabit(item.id)} color="#ff5c5c" />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Habits</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new habit..."
          value={newHabit}
          onChangeText={setNewHabit}
          onSubmitEditing={addHabit}
          ref={textInputRef}
          blurOnSubmit={false} // Add this line
          placeholderTextColor="#888" // Ensure placeholder is visible in dark mode
        />
        <Button title="Add" onPress={addHabit} />
      </View>
      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Add padding to avoid overlap with status bar
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
    color: '#fff', // Ensure text is visible in dark mode
    backgroundColor: '#333' // Darker background for input
  },
  list: {
    flex: 1,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  habitTextContainer: {
      flex: 1, // Take up available space
      marginRight: 10, // Add some space before the remove button
  },
  habitText: {
    fontSize: 18,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
});
