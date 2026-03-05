import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Animated } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
import SongsResultsTab from "./tabs/SongsResultsTab";
import PlaceholderTab from "./tabs/PlaceholderTab";

export type SortMode = "RELEVANCE" | "NAME_AZ" | "NAME_ZA";

type R = RouteProp<RootStackParamList, "SearchResults">;

const TopTab = createMaterialTopTabNavigator();

export default function SearchResultsScreen() {
  const route = useRoute<R>();
  const nav = useNavigation<any>();
  const query = (route.params?.query ?? "").trim();

  const [sortMode, setSortMode] = useState<SortMode>("RELEVANCE");
  const [sortOpen, setSortOpen] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;

  function openSort() {
    setSortOpen(true);
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }

  const title = useMemo(() => (query ? `Results for "${query}"` : "Search"), [query]);

  React.useLayoutEffect(() => {
    nav.setOptions({
      title,
      headerRight: () => (
        <Pressable onPress={openSort} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ fontWeight: "900", color: "#FF6A00" }}>Sort</Text>
        </Pressable>
      ),
    });
  }, [nav, title]);

  return (
    <View style={styles.container}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#FF6A00",
          tabBarIndicatorStyle: { backgroundColor: "#FF6A00" },
          tabBarLabelStyle: { fontWeight: "800", textTransform: "none" },
        }}
      >
        <TopTab.Screen name="Suggested">{() => <SongsResultsTab query={query || "arijit"} sortMode={sortMode} />}</TopTab.Screen>
        <TopTab.Screen name="Songs">{() => <SongsResultsTab query={query} sortMode={sortMode} />}</TopTab.Screen>
        <TopTab.Screen name="Artists">{() => <PlaceholderTab title="Artists coming soon" />}</TopTab.Screen>
        <TopTab.Screen name="Albums">{() => <PlaceholderTab title="Albums coming soon" />}</TopTab.Screen>
      </TopTab.Navigator>

      <Modal visible={sortOpen} transparent animationType="none" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSortOpen(false)}>
          <Animated.View style={[styles.sheet, { opacity: fade }]}>
            <Text style={styles.sheetTitle}>Sort by</Text>

            <SortRow label="Relevance" active={sortMode === "RELEVANCE"} onPress={() => setSortMode("RELEVANCE")} />
            <SortRow label="Name (A → Z)" active={sortMode === "NAME_AZ"} onPress={() => setSortMode("NAME_AZ")} />
            <SortRow label="Name (Z → A)" active={sortMode === "NAME_ZA"} onPress={() => setSortMode("NAME_ZA")} />

            <Pressable style={styles.doneBtn} onPress={() => setSortOpen(false)}>
              <Text style={{ color: "#fff", fontWeight: "900" }}>Done</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

function SortRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.sortRow, active && styles.sortRowActive]}>
      <Text style={[styles.sortText, active && styles.sortTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  sheetTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  sortRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },
  sortRowActive: { borderColor: "#FF6A00", backgroundColor: "rgba(255,106,0,0.08)" },
  sortText: { fontWeight: "800" },
  sortTextActive: { color: "#FF6A00" },
  doneBtn: { marginTop: 6, backgroundColor: "#FF6A00", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
});