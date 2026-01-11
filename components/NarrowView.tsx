import { Colors } from '@/lib/Colors';
import { ScrollView, View } from 'react-native';

export function NarrowView({ 
  children, 
  disableScroll = false 
}: { 
  children: React.ReactNode;
  disableScroll?: boolean;
}) {
  return (
    <View className="flex-1 w-full items-center" style={{ backgroundColor: Colors.background }}>
      <View className='max-w-3xl w-full p-4 flex-1'>
        {disableScroll ? (
          <View className="flex-1">
            {children}
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
