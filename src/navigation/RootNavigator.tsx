import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PlayerScreen from "../screens/PlayerScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import PlaylistsScreen from "../screens/PlaylistScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SearchResultsScreen from "../screens/SearchResultsScreen";
import ArtistDetailsScreen from "../screens/ArtistDetailsScreen";
import AlbumDetailsScreen from "../screens/AlbumDetailsScreen";

export type RootStackParamList = {
  Tabs: undefined;
  Player: undefined;
  SearchResults: { query: string } | undefined;

  ArtistDetails: { artistName: string };
  AlbumDetails: { albumId: string; title: string; art?: string | null; artist?: string; year?: number; songs?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

const ORANGE = "#FF6A00";

function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, any> = {
            Home: "home-outline",
            Favorites: "heart-outline",
            Playlists: "musical-notes-outline",
            Settings: "settings-outline",
          };
          return <Ionicons name={map[route.name] ?? "ellipse-outline"} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontWeight: "800" },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} />
      <Tabs.Screen name="Playlists" component={PlaylistsScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: "Search" }} />

      {/* Custom header in Player */}
      <Stack.Screen name="Player" component={PlayerScreen} options={{ headerShown: false }} />

      {/* Details screens */}
      <Stack.Screen name="ArtistDetails" component={ArtistDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AlbumDetails" component={AlbumDetailsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}