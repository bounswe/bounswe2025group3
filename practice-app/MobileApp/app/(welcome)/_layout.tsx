import TokenManager from '@/app/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#56ea62" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 300,
        presentation: 'transparentModal',
        contentStyle: { backgroundColor: 'transparent' }
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#E8F5E9'
  }
});
