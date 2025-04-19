import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, TextInput, Button, Text } from 'react-native';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useHabits } from '@/contexts/HabitContext'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

export default function HabitsScreen() {
  const { habits, addHabit } = useHabits(); 
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
        <Button title="Add" onPress={handleAddHabit} />
      </View>
      {habits.map(habit => (
        <ThemedView key={habit.id} style={styles.habitContainer}>
          <Text style={styles.habitText}>{habit.name}</Text>
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
