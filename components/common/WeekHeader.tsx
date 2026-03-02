import React from 'react';
import { View } from 'react-native';
import { WeekCalendar, CalendarProvider } from 'react-native-calendars';
import { Colors } from '@/lib/Colors';
import { formatDate } from '@/lib/dateUtils';
import { MarkedDates } from 'react-native-calendars/src/types';
import { useSelectedDate } from '@/lib/selectedDateStore';
import CustomDayHeader from './CustomDayHeader';

export default function WeekHeader() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const formattedSelectedDate = formatDate(selectedDate);

  const markedDates: MarkedDates = {
    [formattedSelectedDate]: {
      selected: true,
    },
  };

  return (
    <View style={{ backgroundColor: Colors.surface, height: 48, overflow: 'hidden' }}>
      <CalendarProvider
        date={formattedSelectedDate}
        onDateChanged={(date) => setSelectedDate(date)}
        style={{ height: 48, overflow: 'hidden' }}
      >
        <WeekCalendar
          current={formattedSelectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          dayComponent={CustomDayHeader}
          calendarHeight={48}
          allowShadow={false}
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
          style={{ height: 48, overflow: 'hidden' }}
        />
      </CalendarProvider>
    </View>
  );
}
