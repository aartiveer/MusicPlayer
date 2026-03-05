// src/screens/HomeTabsScreen.tsx
import React, { useMemo, useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";

import SuggestedTab from "./tabs/SuggestedTab";
import SongsTab from "./tabs/SongsTab";
import ArtistsTab from "./tabs/ArtistsTab";
import AlbumsTab from "./tabs/AlbumsTab";

const TopTab = createMaterialTopTabNavigator();
const ORANGE = "#FF6A00";

export default function HomeTabsScreen() {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState("");

  const q = useMemo(() => query.trim(), [query]);

  return (
    <View style={styles.container}>
      {/* Search bar like Figma header */}
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs, artists, albums..."
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => nav.navigate("SearchResults", { query: q || "arijit" })}
        />
        <Pressable style={styles.searchBtn} onPress={() => nav.navigate("SearchResults", { query: q || "arijit" })}>
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>

      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: ORANGE,
          tabBarInactiveTintColor: "#9a9a9a",
          tabBarIndicatorStyle: { backgroundColor: ORANGE, height: 3, borderRadius: 3 },
          tabBarLabelStyle: { fontWeight: "900", textTransform: "none" },
          tabBarStyle: { backgroundColor: "#fff" },
        }}
      >
        <TopTab.Screen name="Suggested">{() => <SuggestedTab defaultQuery="arijit" />}</TopTab.Screen>
        <TopTab.Screen name="Songs">{() => <SongsTab defaultQuery="arijit" />}</TopTab.Screen>
        <TopTab.Screen name="Artists">{() => <ArtistsTab defaultQuery="arijit" />}</TopTab.Screen>
        <TopTab.Screen name="Albums">{() => <AlbumsTab defaultQuery="arijit" />}</TopTab.Screen>
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F7F7F7",
  },
  searchBtn: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: ORANGE,
  },
  searchBtnText: { color: "#fff", fontWeight: "900" },
});