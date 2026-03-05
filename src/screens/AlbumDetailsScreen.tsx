import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/RootNavigator";
import { searchSongs } from "../api/saavn";
import { Song, pickArtwork, cleanArtists } from "../models/song";
import { usePlayerStore } from "../store/playerStore";
import SongRow from "../components/SongRow";

const ORANGE = "#FF6A00";
type R = RouteProp<RootStackParamList, "AlbumDetails">;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontWeight: "900", fontSize: 16, color: "#111" }}>{value}</Text>
      <Text style={{ marginTop: 4, fontWeight: "800", fontSize: 12, opacity: 0.6 }}>{label}</Text>
    </View>
  );
}

export default function AlbumDetailsScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<R>();
  const { title, art, artist, year, songs } = route.params;

  const setQueue = usePlayerStore((s) => s.setQueue);

  const [list, setList] = useState<Song[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      // In starter, we don't have real album tracks endpoint,
      // so we search by album title to populate the UI.
      const res = await searchSongs(title, 1);
      if (!alive) return;
      setList(res.slice(0, 20));
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, [title]);

  const durationText = useMemo(() => {
    // fake total duration (UI only)
    const totalMin = 38 + (title.length % 20);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }, [title]);

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Album
        </Text>
        <Pressable hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Cover + info */}
      <View style={{ alignItems: "center", paddingHorizontal: 18 }}>
        {art ? <Image source={{ uri: art }} style={styles.cover} /> : <View style={[styles.cover, { backgroundColor: "#eee" }]} />}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {(artist ?? "Unknown")} <Text style={{ opacity: 0.4 }}> | </Text> {year ?? 2023}
        </Text>

        {/* Stats row */}
        <View style={styles.stats}>
          <Stat label="Songs" value={`${songs ?? Math.max(10, list.length)}`} />
          <Stat label="Duration" value={durationText} />
          <Stat label="Year" value={`${year ?? 2023}`} />
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable
            style={[styles.btn, styles.btnGhost]}
            onPress={() => {
              // shuffle: just reverse for demo
              const shuffled = [...list].sort(() => Math.random() - 0.5);
              setQueue(shuffled, 0).then(() => nav.navigate("Player")).catch(() => {});
            }}
          >
            <Ionicons name="shuffle" size={18} color={ORANGE} />
            <Text style={[styles.btnText, { color: ORANGE }]}>Shuffle</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnSolid]}
            onPress={() => setQueue(list, 0).then(() => nav.navigate("Player")).catch(() => {})}
          >
            <Ionicons name="play" size={18} color="#fff" style={{ marginLeft: 2 }} />
            <Text style={[styles.btnText, { color: "#fff" }]}>Play</Text>
          </Pressable>
        </View>
      </View>

      {/* Songs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Songs</Text>
        <Text style={styles.sectionRight}>See All</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 170 }}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPressRow={() => setQueue(list, index).then(() => nav.navigate("Player")).catch(() => {})}
            onPressPlay={() => setQueue(list, index).then(() => nav.navigate("Player")).catch(() => {})}
            showOverflow
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontWeight: "900", fontSize: 16, color: "#111" },

  cover: { width: 240, height: 240, borderRadius: 22, marginTop: 6 },
  title: { marginTop: 16, textAlign: "center", fontSize: 22, fontWeight: "900", color: "#111" },
  sub: { marginTop: 8, textAlign: "center", fontSize: 13, fontWeight: "800", opacity: 0.6 },

  stats: { marginTop: 16, width: "100%", flexDirection: "row", justifyContent: "space-around" },

  btnRow: { marginTop: 18, flexDirection: "row", gap: 12, width: "100%" },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnGhost: { backgroundColor: "rgba(255,106,0,0.10)" },
  btnSolid: { backgroundColor: ORANGE },
  btnText: { fontWeight: "900" },

  sectionHeader: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
  sectionRight: { fontWeight: "900", color: ORANGE },
});