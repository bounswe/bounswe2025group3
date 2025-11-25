import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="add"
      />
      <Stack.Screen
        name="[id]"
      />
    </Stack>
  );
}

