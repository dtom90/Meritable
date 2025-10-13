import { Colors } from '@/lib/Colors';
import { ScrollView, View } from 'react-native';

export function NarrowView({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 w-full items-center" style={{ backgroundColor: Colors.background }}>
      <View className='max-w-3xl w-full p-4 flex-1'>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
