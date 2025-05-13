import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarHideOnKeyboard: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="waste"
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="leaf.fill" color={color} />,
            tabBarLabel: 'Waste Log',
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="target" color={color} />,
            tabBarLabel: 'Goals',
          }}
        />
        <Tabs.Screen
          name="forum"
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.fill" color={color} />,
            tabBarLabel: 'Forum',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
            tabBarLabel: 'Profile',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
