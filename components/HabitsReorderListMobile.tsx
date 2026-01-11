import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Colors } from '@/lib/Colors';
import HabitReorderItem from './HabitReorderItem';
import { useListHabits, useReorderHabits } from '@/db/useHabitDb';
import { Habit } from '@/db/habitDatabase';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function HabitsReorderListMobile() {
  const { data: habitsFromDb = [], isLoading } = useListHabits();
  const { mutate: reorderHabits } = useReorderHabits();

  const handleDragEnd = useCallback(
    ({ data }: { data: Habit[] }) => {
      const reorderedHabits = data.map((habit, index) => ({
        ...habit,
        order: index,
      }));
      reorderHabits(reorderedHabits);
    },
    [reorderHabits]
  );

  const renderItem = useCallback(
    ({ item: habit, drag, isActive }: RenderItemParams<Habit>) => {
      return (
        <ScaleDecorator>
          <Pressable onLongPress={drag} disabled={isActive} delayLongPress={0}>
            <HabitReorderItem habit={habit} isDragging={isActive} isEditMode={true} />
          </Pressable>
        </ScaleDecorator>
      );
    },
    []
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: Colors.text }}>Loading habits...</Text>
      </View>
    );
  }

  if (habitsFromDb.length === 0) {
    return <View className="flex-1 justify-center items-center"></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DraggableFlatList
        data={habitsFromDb}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id?.toString() || ''}
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
}
