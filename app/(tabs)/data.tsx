import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/NarrowView';
import { useDataSource } from '@/db/DataSourceContext';
import CloudAuthSection from '@/components/CloudAuthSection';

export default function DataPage() {
  const { currentDataSource } = useDataSource();

  return (
    <NarrowView>
      <Text className="my-5 text-center text-3xl font-bold leading-8" style={{ color: Colors.text }}>
        Data
      </Text>
      
      <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: Colors.surface }}>
        <Text className="text-xl font-semibold mb-3" style={{ color: Colors.text }}>
          Database Source
        </Text>
        <Text className="text-base mb-4" style={{ color: Colors.textSecondary }}>
          Currently using: {currentDataSource === 'local' ? 'Local Database' : 'Cloud Database'}
        </Text>
      </View>
      
      <CloudAuthSection />
    </NarrowView>
  );
}
