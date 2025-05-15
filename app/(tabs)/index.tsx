import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useHabits } from '@/hooks/useHabitQueries';
import { useHabitCompletions, useAddHabitCompletion, useDeleteHabitCompletion } from '@/hooks/useHabitQueries';
import { IconButton } from 'react-native-paper';

export default function HomeScreen() {
  const tabs = Array.from({ length: 7 }).map((_, index) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - index));

    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const day = targetDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [activeTab, setActiveTab] = useState(tabs[tabs.length - 1]);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'index'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'index'>>();
  const [fabHovered, setFabHovered] = useState(false);
  
  const { data: habits = [], isLoading: isLoadingHabits } = useHabits();
  const { data: completions = [], isLoading: isLoadingCompletions } = useHabitCompletions(activeTab);
  const addCompletionMutation = useAddHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();

  useFocusEffect(
    useCallback(() => {
      if (route.params?.today) {
        setActiveTab(tabs[tabs.length - 1]);
        navigation.setParams({ today: undefined });
      }
    }, [route.params])
  );

  if (isLoadingHabits || isLoadingCompletions) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {habits.length === 0 && <TouchableOpacity
        style={styles.fabLarge}
        onPress={() => navigation.navigate('habits', { focusInput: true })}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>Add Habit</Text>
      </TouchableOpacity>}
      {habits.map(habit => (
        <ThemedView key={habit.id} style={[styles.habitContainer, completions.includes(habit.id!) && styles.completedHabit]}>
          <Text style={styles.habitText}>{habit.name}</Text>
          {!completions.includes(habit.id!) ? (
            <IconButton
              icon="check"
              iconColor="green"
              size={24}
              onPress={() => addCompletionMutation.mutate({ habitId: habit.id!, date: activeTab })}
              style={styles.habitButton}
              disabled={addCompletionMutation.isPending}
            />
          ) : (
            <IconButton
              icon="restore"
              size={24}
              style={styles.habitButton}
              onPress={() => deleteCompletionMutation.mutate({ habitId: habit.id!, date: activeTab })}
              disabled={deleteCompletionMutation.isPending}
            />
          )}
        </ThemedView>
      ))}

      <View style={styles.fabContainer}>
        {fabHovered && (
          <View style={styles.tooltipLeft}>
            <Text style={styles.tooltipText}>Add Habit</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('habits', { focusInput: true })}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setFabHovered(true),
            onMouseLeave: () => setFabHovered(false),
          } : {})}
        >
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#1c1c1e',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF', 
  },
  tabText: {
    fontSize: 14,
    color: '#8e8e93', 
  },
  activeTabText: {
    color: '#0A84FF', 
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20, 
    margin: 10,
    borderRadius: 10,
    alignItems: 'center', 
  },
  habitContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 10,
    minHeight: 68
  },
  habitText: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  habitButton: {
    marginLeft: 'auto',
    marginRight: 0, 
    padding: 0, 
  },
  completedHabit: {
    backgroundColor: 'green',
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabLarge: {
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  fab: {
    position: 'relative', 
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tooltip: {
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  tooltipLeft: {
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
    alignSelf: 'center',
  },
  tooltipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
  },
});
