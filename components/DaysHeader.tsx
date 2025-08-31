import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DaysHeaderProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const tabs = Array.from({ length: 7 }).map((_, index) => {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - (6 - index));

  const year = targetDate.getFullYear();
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const day = targetDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { day: 'numeric', weekday: 'short' });
};

export default function DaysHeader({ selectedDate, onDateSelect }: DaysHeaderProps) {
  return (
    <View className="flex-row justify-around py-2.5 mb-2.5" style={{ backgroundColor: Colors.surface }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          className={`py-2 px-1.5 ${selectedDate === tab ? 'border-b-2' : ''}`}
          style={selectedDate === tab ? { borderBottomColor: Colors.primary } : {}}
          onPress={() => onDateSelect(tab)}>
          <Text 
            className={`text-sm ${selectedDate === tab ? 'font-bold' : ''}`}
            style={{ color: selectedDate === tab ? Colors.primary : Colors.textSecondary }}
          >
            {formatDate(tab)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export { tabs };
