import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayerStore } from "../store/playerStore";
import { pickArtwork, cleanArtists } from "../models/song";

const ORANGE = "#FF6A00";

/**
 * Figma: mini player sits ABOVE bottom tab bar and has Play/Pause + Next.
 * Tab bar height in RootNavigator ~64, so we pin this above it.
 */
export default function MiniPlayer() {
  const navigation = useNavigation<any>();
  const { queue, currentIndex, isPlaying, togglePlay, next } = usePlayerStore();

  const current = queue[currentIndex];
  if (!current) return null;

  const artwork = pickArtwork(current);

  return (
    <View style={styles.container}>
      <Pressable style={styles.left} onPress={() => navigation.navigate("Player")}>
        {artwork ? <Image source={{ uri: artwork }} style={styles.art} /> : <View style={styles.artPlaceholder} />}

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>
            {current.name}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {cleanArtists(current.primaryArtists)}
          </Text>
        </View>
      </Pressable>

      <View style={styles.right}>
        <Pressable style={styles.iconBtn} onPress={() => togglePlay()}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
        </Pressable>

        <Pressable style={styles.iconBtnGhost} onPress={() => next()}>
          <Ionicons name="play-skip-forward" size={18} color={ORANGE} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 64 + 14, // ✅ above tab bar
    backgroundColor: "white",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 8,
  },
  art: { width: 48, height: 48, borderRadius: 12 },
  artPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#eee" },
  title: { fontWeight: "900", fontSize: 14 },
  artist: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnGhost: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,106,0,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
});