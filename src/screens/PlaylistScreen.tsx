// src/screens/PlaylistScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useLibraryStore } from "../store/libraryStore";

const ORANGE = "#FF6A00";

export default function PlaylistScreen() {
  const playlists = useLibraryStore((s) => s.playlists);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);

  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.newRow}>
        <TextInput value={name} onChangeText={setName} placeholder="New playlist name" style={styles.input} />
        <Pressable
          style={styles.btn}
          onPress={() => {
            const n = name.trim();
            if (!n) return;
            createPlaylist(n);
            setName("");
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: "900", fontSize: 16 }}>{item.name}</Text>
            <Text style={{ marginTop: 6, opacity: 0.65, fontWeight: "800" }}>{item.songs.length} songs</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 14 },
  newRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontWeight: "800",
  },
  btn: { backgroundColor: ORANGE, borderRadius: 16, paddingHorizontal: 18, justifyContent: "center" },
  card: { padding: 14, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: "#eee", marginBottom: 10 },
});