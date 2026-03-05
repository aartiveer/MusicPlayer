import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../App";

import HomeSuggestedTab from "./tabs/HomeSuggestedTab";
import HomeSongsTab from "./tabs/HomeSongsTab";
import PlaceholderTab from "./tabs/PlaceholderTab";

const TopTab = createMaterialTopTabNavigator();

export default function HomeTopTabsScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [query, setQuery] = React.useState("arijit");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Ionicons name="musical-notes" size={22} color="#FF6A00" />
          <Text style={styles.brandText}>Mume</Text>
        </View>

        <Pressable
          onPress={() => nav.navigate("SearchResults", { query: query.trim() || "arijit" })}
          style={styles.searchIconBtn}
        >
          <Ionicons name="search-outline" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Search pill (optional, like your current UI) */}
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search..."
          placeholderTextColor="#999"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => nav.navigate("SearchResults", { query: query.trim() || "arijit" })}
        />
        <Pressable
          style={styles.searchBtn}
          onPress={() => nav.navigate("SearchResults", { query: query.trim() || "arijit" })}
        >
          <Text style={{ fontWeight: "900", color: "#fff" }}>Search</Text>
        </Pressable>
      </View>

      {/* Top tabs */}
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#FF6A00",
          tabBarInactiveTintColor: "#666",
          tabBarIndicatorStyle: { backgroundColor: "#FF6A00", height: 3 },
          tabBarLabelStyle: { fontWeight: "900", textTransform: "none" },
        }}
      >
        <TopTab.Screen name="Suggested" component={HomeSuggestedTab} />
        <TopTab.Screen name="Songs" component={HomeSongsTab} />
        <TopTab.Screen name="Artists">{() => <PlaceholderTab title="Artists (next)" />}</TopTab.Screen>
        <TopTab.Screen name="Albums">{() => <PlaceholderTab title="Albums (next)" />}</TopTab.Screen>
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { fontSize: 18, fontWeight: "900" },
  searchIconBtn: { padding: 8, borderRadius: 999 },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  searchBtn: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FF6A00",
  },
});