import { Stack } from 'expo-router';

export default function WasteLayout() {
  return (
    <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
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
          name="custom_category_request"
        />
      </Stack>
  );
}