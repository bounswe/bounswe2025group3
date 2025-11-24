import { SessionProvider, useSession } from '@/hooks/authContext';
import { SplashScreenController } from '@/hooks/splash';
import { ThemeProvider, useTheme } from '@/hooks/themeContext';
import { Stack, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { AlertProvider } from '@/hooks/alertContext';
import "@/i18n";

export default function Root() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <ThemeProvider>
        <AlertProvider>
          <RootLayout/>
        </AlertProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

function RootLayout() {
  const { session, isLoading } = useSession();
  const { isDark } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (!session && pathname === "/") {
      NavigationBar.setButtonStyleAsync('light');
      return;
    }
    if (isDark) {
      NavigationBar.setButtonStyleAsync('light');
    } else {
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, [isDark, pathname, session]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false}}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ animation: 'none', statusBarStyle: "dark"}} />
        <Stack.Screen name="events" options={{ animation: 'none', statusBarStyle: "dark"}} />
        <Stack.Screen
          name="menu_drawer"
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'none',
            statusBarStyle: "dark",
          }}
        />
        <Stack.Screen
          name="custom_category_request"
          options={{animation: "slide_from_bottom", statusBarStyle: "dark"}}
        />
        <Stack.Screen
          name="edit_profile"
          options={{ animation: 'slide_from_bottom', statusBarStyle: "dark"}}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'none',
            statusBarStyle: "dark",
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" options={{ animation: 'none', statusBarStyle: "light"}} />
        <Stack.Screen
          name="login"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            statusBarStyle: "light",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            statusBarStyle: "light",
          }}
        />
        <Stack.Screen
          name="forgot_password"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            statusBarStyle: "light",
          }}
        />
        <Stack.Screen
          name="term_condition"
          options={{
            statusBarStyle: "dark",
            presentation: 'transparentModal',
            animation: "simple_push",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
