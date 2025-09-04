import React from 'react';
import { View } from 'react-native';
import { WeekCalendar } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { formatDate } from '@/utils/dateUtils';
import { MarkedDates } from 'react-native-calendars/src/types';
import CustomDayHeader from './CustomDayHeader';

interface DaysHeaderProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function DaysHeader({ selectedDate, onDateSelect }: DaysHeaderProps) {
  const formattedSelectedDate = formatDate(selectedDate);

  const markedDates: MarkedDates = {
    [formattedSelectedDate]: {
      selected: true,
    },
  };

  return (
    <View style={{ backgroundColor: Colors.surface }}>
      <WeekCalendar
        current={formattedSelectedDate}
        onDayPress={(day) => onDateSelect(day.dateString)}
        markedDates={markedDates}
        dayComponent={CustomDayHeader}
        theme={{
          backgroundColor: Colors.surface,
          calendarBackground: Colors.surface,
          stylesheet: {
            expandable: {
              main: {
                week: {
                  marginTop: 0,
                  marginBottom: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                },
              },
            },
          },
        }}
        firstDay={6}
        hideDayNames={true}
      />
    </View>
  );
}
