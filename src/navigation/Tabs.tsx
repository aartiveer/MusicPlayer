// src/navigation/Tabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import PlaylistScreen from "../screens/PlaylistScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const ORANGE = "#FF6A00";
const GRAY = "#9AA0A6";

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: GRAY,
        tabBarLabelStyle: { fontWeight: "800" },
        tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, any> = {
            Home: "home-outline",
            Favorites: "heart-outline",
            Playlist: "musical-notes-outline",
            Settings: "settings-outline",
          };
          return <Ionicons name={map[route.name] ?? "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Mume" }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favorites" }} />
      <Tab.Screen name="Playlist" component={PlaylistScreen} options={{ title: "Playlist" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
}