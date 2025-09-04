import React from 'react';
import { View, Text } from 'react-native';
import { WeekCalendar } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { formatDate, getToday } from '@/utils/dateUtils';
import { MarkedDates } from 'react-native-calendars/src/types';

interface DaysHeaderProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function DaysHeader({ selectedDate, onDateSelect }: DaysHeaderProps) {
  const today = getToday();
  const formattedSelectedDate = formatDate(selectedDate);

  const markedDates: MarkedDates = {};

  // Style for the selected date
  markedDates[formattedSelectedDate] = {
    selected: true,
    selectedColor: Colors.info, // Light blue background
    selectedTextColor: Colors.background,
  };

  // Style for today's date (dark blue ring)
  const todayMarking = {
    customStyles: {
      container: {
        borderWidth: 2,
        borderColor: Colors.secondary, // Dark blue ring
        borderRadius: 18,
        width: 36,
        height: 36,
        backgroundColor: today === formattedSelectedDate ? Colors.info : 'transparent',
      },
      text: {
        color: today === formattedSelectedDate ? Colors.background : Colors.text,
      },
    },
  };

  if (markedDates[today]) {
    markedDates[today] = {
      ...markedDates[today],
      ...todayMarking,
      customStyles: {
        ...markedDates[today].customStyles,
        ...todayMarking.customStyles,
        container: {
          ...markedDates[today].customStyles?.container,
          ...todayMarking.customStyles.container,
        },
        text: {
          ...markedDates[today].customStyles?.text,
          ...todayMarking.customStyles.text,
        },
      },
    };
  } else {
    markedDates[today] = todayMarking;
  }

  return (
    <View style={{ backgroundColor: Colors.surface }}>
      <Text style={{ color: Colors.text, textAlign: 'center', marginVertical: 8 }}>
        {formattedSelectedDate}
      </Text>
      <WeekCalendar
        current={formattedSelectedDate}
        onDayPress={(day) => onDateSelect(day.dateString)}
        markedDates={markedDates}
        markingType={'custom'}
        theme={{
          backgroundColor: Colors.surface,
          calendarBackground: Colors.surface,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayTextColor: Colors.text,
          selectedDayBackgroundColor: 'transparent',
          todayTextColor: Colors.text,
          dayTextColor: Colors.text,
        }}
        firstDay={6}
        disableMonthChange={true}
        enableSwipeMonths={false}
      />
    </View>
  );
}
