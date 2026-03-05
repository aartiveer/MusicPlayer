import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import { Song, pickArtwork } from "../../models/song";
import { searchSongs } from "../../api/saavn";
import { usePlayerStore } from "../../store/playerStore";
import { RootStackParamList } from "../../navigation/RootNavigator";

const ORANGE = "#FF6A00";

export default function SuggestedTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [recently, setRecently] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [artists, setArtists] = useState<{ name: string; art?: string | null }[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Seed lists (until you wire real history/favorites/plays)
      const popular = await searchSongs("top", 1);
      if (!alive) return;

      const r = popular.slice(0, 8);
      const m = popular.slice(8, 16);

      setRecently(r);
      setMostPlayed(m);

      const derived = popular
        .flatMap((s) =>
          (s.primaryArtists ?? "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
            .map((name) => ({ name, art: pickArtwork(s) }))
        )
        .filter((x) => x.name);

      const uniq = Array.from(new Map(derived.map((x) => [x.name, x])).values()).slice(0, 12);
      setArtists(uniq);
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const page = useMemo(() => [{ key: "content" }], []);

  return (
    <FlatList
      data={page}
      keyExtractor={(i) => i.key}
      contentContainerStyle={{ paddingBottom: 140 }}
      renderItem={() => (
        <View style={styles.container}>
          <SectionHeader title="Recently Played" onSeeAll={() => nav.navigate("SearchResults", { query: "top" })} />
          <HorizontalSongs
            data={recently}
            onPress={async (songs, index) => {
              await setQueue(songs, index);
              nav.navigate("Player");
            }}
          />

          <SectionHeader title="Artists" onSeeAll={() => nav.navigate("SearchResults", { query: "artist" })} />
          <FlatList
            data={artists}
            keyExtractor={(i) => i.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 10 }}
            renderItem={({ item }) => (
              <View style={{ alignItems: "center", marginRight: 14 }}>
                {item.art ? <Image source={{ uri: item.art }} style={styles.artistAvatar} /> : <View style={[styles.artistAvatar, styles.ph]} />}
                <Text numberOfLines={1} style={styles.artistName}>
                  {item.name}
                </Text>
              </View>
            )}
          />

          <SectionHeader title="Most Played" onSeeAll={() => nav.navigate("SearchResults", { query: "hits" })} />
          <HorizontalSongs
            data={mostPlayed}
            onPress={async (songs, index) => {
              await setQueue(songs, index);
              nav.navigate("Player");
            }}
          />
        </View>
      )}
    />
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </Pressable>
    </View>
  );
}

function HorizontalSongs({
  data,
  onPress,
}: {
  data: Song[];
  onPress: (songs: Song[], index: number) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 10 }}
      renderItem={({ item, index }) => {
        const art = pickArtwork(item);
        return (
          <Pressable onPress={() => onPress(data, index)} style={styles.card}>
            {art ? <Image source={{ uri: art }} style={styles.cardArt} /> : <View style={[styles.cardArt, styles.ph]} />}
            <Text numberOfLines={2} style={styles.cardTitle}>
              {item.name}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 8 },

  sectionHeader: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  seeAll: { color: ORANGE, fontWeight: "900" },

  card: { width: 130, marginRight: 12 },
  cardArt: { width: 130, height: 130, borderRadius: 18, backgroundColor: "#f2f2f2" },
  cardTitle: { marginTop: 10, fontWeight: "900", fontSize: 12 },

  artistAvatar: { width: 72, height: 72, borderRadius: 999, backgroundColor: "#f2f2f2" },
  artistName: { marginTop: 8, width: 72, textAlign: "center", fontWeight: "800", fontSize: 12 },

  ph: { backgroundColor: "#f2f2f2" },
});