import { Stack } from 'expo-router';

export default function GoalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="add"
      />
      <Stack.Screen
        name="[id]"
      />
      <Stack.Screen
        name="templates"
      />
    </Stack>
  );
} 