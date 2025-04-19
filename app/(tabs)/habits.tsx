import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, TextInput, FlatList, Button, Text, TouchableOpacity } from 'react-native';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useHabits, Habit } from '@/contexts/HabitContext'; 

export default function HabitsScreen() {
  const { habits, addHabit, setHabits } = useHabits(); 
  const [newHabitText, setNewHabitText] = useState(''); 
  const textInputRef = useRef<TextInput>(null);
  const route = useRoute();
  const navigation = useNavigation();

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
      addHabit({ text: newHabitText.trim(), completed: false }); 
      setNewHabitText(''); 
    }
  };

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const renderItem = ({ item }: { item: Habit }) => (
    <TouchableOpacity onPress={() => toggleHabit(item.id)} style={styles.habitItem}>
      <Text style={[styles.habitText, item.completed && styles.completedText]}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
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
        <Button title="Add" onPress={handleAddHabit} />
      </View>
      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </ThemedView>
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
  habitText: {
    fontSize: 18,
    color: '#fff',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
});
