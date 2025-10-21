import { SessionProvider, useSession } from '@/hooks/authContext';
import { SplashScreenController } from '@/hooks/splash';
import { ThemeProvider } from '@/hooks/themeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function Root(){
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootLayout />
    </SessionProvider>
  );
}

function RootLayout() {
  const { session, isLoading } = useSession(); 

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack
      screenOptions={{
        headerShown: false,
      }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options ={{animation: "none"}}/>
          <Stack.Screen 
            name="menu_drawer"
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen name="edit_profile" options ={{animation: "slide_from_bottom"}}/>
          <Stack.Screen name="settings" options ={{presentation: "transparentModal", animation: "none"}}/>
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="index" options ={{animation: "none"}}/>
          <Stack.Screen name="login" options={{presentation: "transparentModal", animation:"none"}}/>
          <Stack.Screen name="register" options={{presentation: "transparentModal", animation: "none"}}/>
          <Stack.Screen name="forgot_password" options={{presentation: "transparentModal", animation:"none"}}/>
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}