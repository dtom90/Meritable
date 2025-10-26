import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useDataSource } from '@/db/DataSourceContext';
import { useAuth } from '@/db/AuthContext';
import LoginOverlay from '@/components/LoginOverlay';
import { NarrowView } from '@/components/NarrowView';

export default function DataPage() {
  const { currentDataSource } = useDataSource();
  const { isAuthenticated, user, signOut } = useAuth();
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const handleLoginSuccess = () => {
    setShowLoginOverlay(false);
  };

  const handleCloseLogin = () => {
    setShowLoginOverlay(false);
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      // Use custom modal for web
      setShowSignOutAlert(true);
    } else {
      // Use native Alert for mobile
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ]
      );
    }
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowSignOutAlert(false);
  };

  const cancelSignOut = () => {
    setShowSignOutAlert(false);
  };

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
          
          <View className="flex-row items-center gap-2 opacity-50">
            <Text className="text-base font-medium" style={{ color: Colors.textSecondary }}>
              Local
            </Text>
            <View
              className="w-16 h-8 rounded-full p-1"
              style={{ backgroundColor: currentDataSource === 'local' ? Colors.textTertiary : Colors.primary }}
            >
              <View 
                className="w-6 h-6 rounded-full"
                style={{ 
                  backgroundColor: Colors.background,
                  transform: [{ translateX: currentDataSource === 'local' ? 0 : 24 }]
                }}
              />
            </View>
            <Text className="text-base font-medium" style={{ color: Colors.textSecondary }}>
              Cloud
            </Text>
          </View>
          
          <Text className="text-sm mt-3" style={{ color: Colors.textTertiary }}>
            Data source is fixed based on your platform
          </Text>
          
          {currentDataSource === 'cloud' && !isAuthenticated && (
            <TouchableOpacity
              className="w-full h-12 rounded-lg items-center justify-center mt-4"
              style={{ backgroundColor: Colors.primary }}
              onPress={() => setShowLoginOverlay(true)}
            >
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
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

      {/* Custom Sign Out Alert Modal for Web */}
      {showSignOutAlert && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
          <View className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <Text className="text-xl font-bold mb-3 text-center text-gray-800">
              Sign Out
            </Text>
            <Text className="text-base mb-6 text-center text-gray-600">
              Are you sure you want to sign out?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.textTertiary }}
                onPress={cancelSignOut}
              >
                <Text className="text-white font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.error }}
                onPress={confirmSignOut}
              >
                <Text className="text-white font-semibold text-base">
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <LoginOverlay
        visible={showLoginOverlay}
        onClose={handleCloseLogin}
        onSuccess={handleLoginSuccess}
      />
    </NarrowView>
  );
}
