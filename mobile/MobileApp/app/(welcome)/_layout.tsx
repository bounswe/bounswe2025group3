import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 400,
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
      <Stack.Screen
        name="reset-code"
      />
    </Stack>
  );
}
