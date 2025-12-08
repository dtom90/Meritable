import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/NarrowView';
import { useDataSource } from '@/db/DataSourceContext';
import CloudAuthSection from '@/components/CloudAuthSection';
import { isTestFlight } from '@/lib/useIsRegisteredTestDevice';

const SHOW_CLOUD_AUTH_KEY = 'showCloudAuth';

export default function DataPage() {
  const { currentDataSource } = useDataSource();
  const [showCloudAuth, setShowCloudAuth] = useState<boolean>(false);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        if (Platform.OS === 'web') {
          // On web, show cloud auth if local storage value is set
          const value = typeof window !== 'undefined' ? localStorage.getItem(SHOW_CLOUD_AUTH_KEY) : null;
          setShowCloudAuth(value !== null && value === 'true');
        } else {
          // On mobile, show cloud auth if in TestFlight
          if (isTestFlight()) {
            setShowCloudAuth(true);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking storage:', error);
        setShowCloudAuth(false);
      }
    };

    checkStorage();
  }, []);

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
          <Text>Currently using: </Text>
          <Text>{currentDataSource === 'local' ? 'Local Database' : 'Cloud Database'}</Text>
        </Text>
      </View>
      
      {showCloudAuth ? (
        <CloudAuthSection />
      ) : (
        <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: Colors.surface }}>
          <Text className="text-base text-center" style={{ color: Colors.textSecondary }}>
            Cloud sync coming soon!
          </Text>
        </View>
      )}
    </NarrowView>
  );
}
