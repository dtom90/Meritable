import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useDataSource } from '@/contexts/DataSourceContext';
import { useAuth } from '@/contexts/AuthContext';
import LoginOverlay from '@/components/LoginOverlay';

export default function DataPage() {
  const { currentDataSource, setDataSource } = useDataSource();
  const { isAuthenticated, user, signOut } = useAuth();
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const toggleDataSource = () => {
    if (currentDataSource === 'local') {
      // Switching to cloud - check if user is authenticated
      if (!isAuthenticated) {
        setShowLoginOverlay(true);
        return;
      }
    }
    // If switching to local or already authenticated for cloud
    setDataSource(currentDataSource === 'local' ? 'cloud' : 'local');
  };

  const handleLoginSuccess = () => {
    setShowLoginOverlay(false);
    // Now switch to cloud since user is authenticated
    setDataSource('cloud');
  };

  const handleCloseLogin = () => {
    setShowLoginOverlay(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? This will switch you back to local database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Switch back to local database when signing out
            setDataSource('local');
          },
        },
      ]
    );
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
            
            {currentDataSource === 'cloud' && !isAuthenticated && (
              <View className="mt-4 p-3 rounded-lg" style={{ backgroundColor: Colors.card }}>
                <Text className="text-sm text-center" style={{ color: Colors.warning }}>
                  ⚠️ You need to sign in to access cloud data
                </Text>
              </View>
            )}
            
            {currentDataSource === 'cloud' && isAuthenticated && (
              <View className="mt-4 p-3 rounded-lg" style={{ backgroundColor: Colors.card }}>
                <Text className="text-sm text-center" style={{ color: Colors.success }}>
                  ✅ Connected to cloud database
                </Text>
              </View>
            )}
          </View>

          {isAuthenticated && (
            <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: Colors.surface }}>
              <Text className="text-xl font-semibold mb-3" style={{ color: Colors.text }}>
                Account
              </Text>
              <Text className="text-base mb-3" style={{ color: Colors.textSecondary }}>
                Signed in as: {user?.email}
              </Text>
              <TouchableOpacity
                className="w-full h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.error }}
                onPress={handleSignOut}
              >
                <Text className="text-white font-semibold text-base">
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>

      <LoginOverlay
        visible={showLoginOverlay}
        onClose={handleCloseLogin}
        onSuccess={handleLoginSuccess}
      />
    </SafeAreaView>
  );
}
