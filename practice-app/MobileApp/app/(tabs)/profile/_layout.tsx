import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

// Define consistent colors from our web frontend
const GREENER_COLORS = {
  primary: '#2E7D32',
  secondary: '#56ea62',
  primaryDark: '#122e1a',
  primaryLight: '#88eb9a',
  background: '#E8F5E9',
  white: '#ffffff'
};

export default function ProfileLayout() {

  return (
    <View style={[styles.container]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: GREENER_COLORS.white,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
        />
        <Stack.Screen
          name="edit"
        />
        <Stack.Screen
          name="change-password"
        />
        <Stack.Screen
          name="jwt-debug"
        />
        <Stack.Screen
          name="role-test"
        />
        <Stack.Screen
          name="admin-diagnostics"
        />
        <Stack.Screen
          name="admin-endpoints-test"
        />
      </Stack>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREENER_COLORS.white,
  },
});