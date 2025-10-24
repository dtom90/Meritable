import { Colors } from "@/lib/Colors";
import { useListHabitCompletionsByHabitId } from "@/db/useHabitDb";
import { getToday } from "@/lib/dateUtils";
import { View, Text } from "react-native";
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from "react-native-calendars/src/types";


export default function HabitCompletionsCalendar({ habitId }: { habitId: number }) {
  const { data: completions = [] } = useListHabitCompletionsByHabitId(habitId);
  const completionDates = completions.map(completion => completion.completionDate);

  const today = getToday();

  const markedDates: MarkedDates = completionDates.reduce((acc, date) => {
    acc[date] = {
      selected: true,
      selectedColor: 'green',
      selectedTextColor: 'white',
      customStyles: {
        container: {
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: 'black',
          borderRadius: 16,
          width: 32,
          height: 32
        }
      }
    };
    return acc;
  }, {} as any);

  // Add today's date with blue outline
  markedDates[today] = {
    ...markedDates[today], // Preserve existing completion data if today has a completion
    customStyles: {
      container: {
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 16,
        width: 32,
        height: 32
      },
      text: {
        color: 'white',
        fontWeight: 'bold'
      }
    }
  };

  return (
    <View className="p-6 rounded-lg mb-6" style={{ backgroundColor: Colors.surface }}>
      <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
        Habit Completions
      </Text>

      <View>
        <Calendar
          markedDates={markedDates}
          markingType={'custom'}
          theme={{
            textDayFontSize: 12,
            textMonthFontSize: 14,
            textDayHeaderFontSize: 12,
            textDayFontWeight: 'bold',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
            backgroundColor: 'black',
            calendarBackground: 'black',
            textSectionTitleColor: 'white',
            selectedDayBackgroundColor: 'green',
            selectedDayTextColor: 'white',
            todayTextColor: 'blue',
            monthTextColor: 'white',
            dayTextColor: '#bbbbbb',
            textDisabledColor: '#444444'
          }}
        />
      </View>
    </View>
  );
}
