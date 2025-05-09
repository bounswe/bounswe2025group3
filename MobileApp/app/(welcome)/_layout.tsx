import TokenManager from '@/app/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have tokens
      const hasTokens = await TokenManager.hasValidTokens();
      
      if (hasTokens) {
        // Try to verify the token by making a test request
        const response = await TokenManager.authenticatedFetch(API_ENDPOINTS.AUTH.TEST_PROTECTED);
        
        if (response.ok) {
          // Token is valid, redirect to main app
          router.replace('/(tabs)');
          return;
        } else {
          // Token is invalid, try to refresh
          const refreshSuccess = await TokenManager.refreshToken();
          if (refreshSuccess) {
            router.replace('/(tabs)');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Auto-login error:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="login"
      />
      <Stack.Screen
        name="register"
      />
      <Stack.Screen
        name="reset-password"
      />
    </Stack>
  );
}
