// src/screens/FavoritesScreen.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useLibraryStore } from "../store/libraryStore";
import { usePlayerStore } from "../store/playerStore";
import SongRow from "../components/SongRow";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#FF6A00";

export default function FavoritesScreen() {
  const favorites = useLibraryStore((s) => s.favorites);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const setQueue = usePlayerStore((s) => s.setQueue);

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ fontWeight: "900" }}>No favorites yet</Text>
            <Text style={{ marginTop: 6, opacity: 0.65, fontWeight: "800" }}>
              Tap ♥ on a song to add it here.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPress={async () => {
              await setQueue(favorites, index);
            }}
            right={
              <Pressable onPress={() => toggleFavorite(item)} style={styles.iconBtn}>
                <Ionicons name="heart" size={18} color={ORANGE} />
              </Pressable>
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  iconBtn: { width: 44, height: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
});