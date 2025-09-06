import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { Colors } from '@/lib/Colors';
import { getToday } from '@/lib/dateUtils';
import { DateData, DayState } from 'react-native-calendars/src/types';

interface CustomDayHeaderProps {
  date?: DateData;
  state?: DayState;
  marking?: MarkingProps;
  onPress?: (date: DateData) => void;
}

const CustomDayHeader: React.FC<CustomDayHeaderProps> = ({ date, state, onPress, marking = {} }) => {
  if (!date) {
    return <View />;
  }

  const today = getToday();
  const isToday = date.dateString === today;
  const isSelected = !!marking.selected;
  const dayOfWeek = new Date(date.dateString).toLocaleDateString('en-US', { weekday: 'short' });

  const containerStyle: any = {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.surface
  };

  const dayOfWeekStyle: any = {
    color: Colors.textSecondary,
    fontSize: 12,
  };

  const dateStyle: any = {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  };

  if (isToday) {
    containerStyle.backgroundColor = 'transparent';
    containerStyle.borderColor = Colors.secondary;
  }

  if (isSelected) {
    containerStyle.backgroundColor = Colors.info;
    dayOfWeekStyle.color = Colors.background;
    dateStyle.color = Colors.background;
  }

  return (
    <TouchableOpacity onPress={() => onPress?.(date)} style={containerStyle}>
      <Text style={dayOfWeekStyle}>{dayOfWeek}</Text>
      <Text style={dateStyle}>{date.day}</Text>
    </TouchableOpacity>
  );
};

export default CustomDayHeader;
