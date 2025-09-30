import { Stack } from 'expo-router';

export default function ModeratorLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Moderator Dashboard',
        }}
      />
      <Stack.Screen
        name="user-management"
        options={{
          title: 'User Management',
        }}
      />
      <Stack.Screen
        name="category-requests"
        options={{
          title: 'Category Requests',
        }}
      />
    </Stack>
  );
} 