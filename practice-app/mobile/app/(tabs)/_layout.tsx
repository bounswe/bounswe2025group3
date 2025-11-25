import { useColors } from '@/constants/colors';
import { Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";


export default function TabLayout() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.borders,
          borderTopWidth:1,
          borderBottomWidth: 0,
          elevation:0,
          shadowRadius: 0,
          zIndex: 995,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#85948A",
    }}> 
        <Tabs.Screen 
          name="home"  
          options={{
            title: t("tabs.home"), tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={28} color={color} />
          }}
        />
        <Tabs.Screen 
          name="waste" 
          options={{ 
            title: t("tabs.waste"), tabBarIcon: ({ color }) => <Ionicons name="leaf" size={28} color={color} />, 
          }} 
        /> 
        <Tabs.Screen 
          name="goals" 
          options={{ 
            title: t("tabs.goals"), tabBarIcon: ({ color }) => <Octicons name="goal" size={28} color={color} />, 
          }} 
        />
        <Tabs.Screen
          name="challenges"
          options={{
            title: t("tabs.challenges"), tabBarIcon: ({ color }) => <Ionicons name="trophy" size={26} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="leaderboard" 
          options={{ 
            title: t("tabs.leaderboard"), tabBarIcon: ({ color }) => <MaterialIcons name="leaderboard" size={28} color={color} />, 
          }} 
        />  
    </Tabs>
  );
}
