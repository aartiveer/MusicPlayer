// src/components/AnimatedMiniPlayer.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { usePlayerStore } from "../store/playerStore";
import { RootStackParamList } from "../navigation/RootNavigator";
import { pickArtwork } from "../models/song";

const ORANGE = "#FF6A00";

export default function AnimatedMiniPlayer() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const { queue, currentIndex, isPlaying, togglePlay } = usePlayerStore();
  const current = queue[currentIndex];

  const y = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    Animated.timing(y, {
      toValue: current ? 0 : 120,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [current, y]);

  const art = useMemo(() => (current ? pickArtwork(current) : null), [current]);

  if (!current) return null;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY: y }] }]}>
      <Pressable style={styles.card} onPress={() => nav.navigate("Player")}>
        <View style={styles.artWrap}>
          {art ? <Image source={{ uri: art }} style={styles.art} /> : <View style={[styles.art, { backgroundColor: "#eee" }]} />}
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>
            {current.name}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {current.primaryArtists ?? "Unknown artist"}
          </Text>
        </View>

        <Pressable onPress={() => togglePlay()} style={styles.playBig} hitSlop={10}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#fff" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 78, // sits above bottom tabs
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  artWrap: { width: 48, height: 48, borderRadius: 16, overflow: "hidden" },
  art: { width: 48, height: 48, borderRadius: 16 },
  title: { fontSize: 14, fontWeight: "900" },
  subtitle: { marginTop: 3, fontSize: 11, opacity: 0.65, fontWeight: "700" },
  playBig: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
});