import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useDataSource } from '@/contexts/DataSourceContext';

export default function DataPage() {
  const { currentDataSource, setDataSource } = useDataSource();

  const toggleDataSource = () => {
    setDataSource(currentDataSource === 'local' ? 'cloud' : 'local');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
        <Text className="mb-5 text-center text-3xl font-bold leading-8" style={{ color: Colors.text }}>
          Data
        </Text>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

          <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: Colors.surface }}>
            <Text className="text-xl font-semibold mb-3" style={{ color: Colors.text }}>
              Database Source
            </Text>
            <Text className="text-base mb-4" style={{ color: Colors.textSecondary }}>
              Currently using: {currentDataSource === 'local' ? 'Local Database' : 'Cloud Database'}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-medium" style={{ color: Colors.textSecondary }}>
                Local
              </Text>
              <TouchableOpacity
                className="w-16 h-8 rounded-full p-1"
                style={{ backgroundColor: currentDataSource === 'local' ? Colors.textTertiary : Colors.primary }}
                onPress={toggleDataSource}
              >
                <View 
                  className="w-6 h-6 rounded-full"
                  style={{ 
                    backgroundColor: Colors.background,
                    transform: [{ translateX: currentDataSource === 'local' ? 0 : 24 }]
                  }}
                />
              </TouchableOpacity>
              <Text className="text-base font-medium" style={{ color: Colors.textSecondary }}>
                Cloud
              </Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
