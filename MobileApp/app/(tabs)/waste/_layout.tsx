import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WasteLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
        <Stack.Screen
        name="index"
        options={{
            headerShown: false,
        }}
        />
        <Stack.Screen
          name="add"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="custom_category_request"
          options={{
            headerShown: false,
        }}
      />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
}); 