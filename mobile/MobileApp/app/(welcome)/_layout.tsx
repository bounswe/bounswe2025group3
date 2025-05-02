import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <ImageBackground
      source={require('@/assets/images/welcome.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "transparent" },
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 400,
            presentation: 'card',
          }}
        >
          <Stack.Screen name="index" />

          <Stack.Screen
            name="login"
            options={{
              animation: 'slide_from_right',
              animationDuration: 400,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              animation: 'slide_from_right',
              animationDuration: 400,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="reset-password"
            options={{
              animation: 'slide_from_right',
              animationDuration: 400,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="reset-code"
            options={{
              animation: 'slide_from_right',
              animationDuration: 400,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="reset-success"
            options={{
              animation: 'slide_from_right',
              animationDuration: 400,
              presentation: 'card',
            }}
          />
        </Stack>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});
