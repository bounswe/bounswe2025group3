import { Stack } from 'expo-router';
import React from 'react';


export default function HomeLayout() {

  return (
    <Stack
    screenOptions={{
    headerShown: false,
    animation: "none",
    }}>
      <Stack.Screen name="index" options ={{animation: "none"}}/>
      <Stack.Screen name="profile" options ={{animation: "none"}}/>
      <Stack.Screen name="admin" options ={{animation: "none"}}/>
    </Stack>
  );
}

