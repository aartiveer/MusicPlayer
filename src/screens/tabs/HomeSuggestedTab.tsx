import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { searchSongs } from "../../api/saavn";
import { Song, pickArtwork } from "../../models/song";
import { usePlayerStore } from "../../store/playerStore";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../../App";

function Card({ song, onPress }: { song: Song; onPress: () => void }) {
  const art = pickArtwork(song);
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image
        source={art ? { uri: art } : undefined}
        style={styles.cardImg}
      />
      <Text numberOfLines={2} style={styles.cardTitle}>
        {song.name}
      </Text>
      <Text numberOfLines={1} style={styles.cardSub}>
        {song.primaryArtists ?? "Unknown artist"}
      </Text>
    </Pressable>
  );
}

export default function HomeSuggestedTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Song[]>([]);
  const [most, setMost] = useState<Song[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Just demo data; later you can wire from "recently played" store
        const a = await searchSongs("arijit", 1);
        const b = await searchSongs("pritam", 1);
        setRecent(a.slice(0, 10));
        setMost(b.slice(0, 10));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ paddingTop: 30 }}>
        <ActivityIndicator />
        <Text style={{ textAlign: "center", marginTop: 10, opacity: 0.7 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[{ key: "content" }]}
      keyExtractor={(x) => x.key}
      contentContainerStyle={{ paddingBottom: 120 }}
      renderItem={() => (
        <View>
          <Section
            title="Recently Played"
            onSeeAll={() => nav.navigate("SearchResults", { query: "arijit" })}
            data={recent}
            onPressItem={async (songs, index) => {
              await setQueue(songs, index);
              nav.navigate("Player");
            }}
          />

          <Section
            title="Most Played"
            onSeeAll={() => nav.navigate("SearchResults", { query: "pritam" })}
            data={most}
            onPressItem={async (songs, index) => {
              await setQueue(songs, index);
              nav.navigate("Player");
            }}
          />

          {/* Artists section placeholder like your screenshot */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Artists</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 18 }}>
            <Text style={{ opacity: 0.65 }}>
              (Next) We’ll implement Artists API + circular avatars.
            </Text>
          </View>
        </View>
      )}
    />
  );
}

function Section({
  title,
  onSeeAll,
  data,
  onPressItem,
}: {
  title: string;
  onSeeAll: () => void;
  data: Song[];
  onPressItem: (songs: Song[], index: number) => void;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item, index }) => (
          <Card song={item} onPress={() => onPressItem(data, index)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  seeAll: { color: "#FF6A00", fontWeight: "900" },

  card: { width: 140, marginRight: 12 },
  cardImg: { width: 140, height: 140, borderRadius: 18, backgroundColor: "#EEE" },
  cardTitle: { marginTop: 8, fontWeight: "900" },
  cardSub: { marginTop: 2, opacity: 0.7, fontSize: 12 },
});