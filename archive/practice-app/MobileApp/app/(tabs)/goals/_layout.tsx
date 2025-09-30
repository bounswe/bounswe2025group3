import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';

export default function GoalsLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="add"
        options={{
          presentation: 'modal',
        }}
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