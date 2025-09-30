import { HapticTab } from '@/components/HapticTab';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useUser } from '@/app/UserContext';

// Define consistent colors from our web frontend
const GREENER_COLORS = {
  primary: '#2E7D32',
  secondary: '#56ea62',
  background: '#E8F5E9',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();

  // Common tab options
  const getTabOptions = (iconName: IconSymbolName, label: string) => ({
    tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name={iconName} color={color} />,
    tabBarLabel: label,
  });

  return (
    <View style={styles.container}>
      <Tabs screenOptions={{
        tabBarActiveTintColor: GREENER_COLORS.secondary,
        tabBarInactiveTintColor: GREENER_COLORS.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500' as const,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: GREENER_COLORS.background,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarHideOnKeyboard: true,
      }}>
        <Tabs.Screen name="index" options={getTabOptions("house.fill", "Home")} />
        <Tabs.Screen name="waste" options={getTabOptions("leaf.fill", "Waste Log")} />
        <Tabs.Screen name="goals" options={getTabOptions("target", "Goals")} />
        <Tabs.Screen 
          name="environment" 
          options={{
            ...getTabOptions("globe.europe.africa.fill", "Environment"),
            href: null  // Hide this tab
          }} 
        />
        <Tabs.Screen name="forum" options={getTabOptions("bubble.left.fill", "Forum")} />
        <Tabs.Screen name="profile" options={getTabOptions("person.circle.fill", "Profile")} />
        <Tabs.Screen 
          name="admin" 
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.fill" color={color} />,
            tabBarLabel: "Admin",
            href: null  // Hide this tab from all users
          }} 
        />
        <Tabs.Screen 
          name="moderator" 
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.lefthalf.fill" color={color} />,
            tabBarLabel: "Moderator",
            href: null  // Hide this tab from all users
          }} 
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
