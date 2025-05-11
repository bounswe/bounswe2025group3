import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';

export default function ForumLayout() {
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
    </Stack>
  );
}