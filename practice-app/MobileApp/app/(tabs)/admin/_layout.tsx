import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AdminLayout() {
  // Render admin content for everyone
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Dashboard",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: "User Management",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="category-requests"
        options={{
          title: "Category Requests",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 