import { useSession } from '@/hooks/authContext';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  const { userRole, isLoading} = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={userRole === 'ADMIN'}>
        <Stack.Screen
            name="index"
            options={{
            headerShown: false,
            }}
        />
        <Stack.Screen
            name="users"
            options={{
            headerShown: true,
            }}
        />
        <Stack.Screen
            name="category-requests"
            options={{
            headerShown: true,
            }}
        />
      </Stack.Protected>
    </Stack>
  );
}