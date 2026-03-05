import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SongRow from "../../components/SongRow";
import { searchSongs } from "../../api/saavn";
import { Song } from "../../models/song";
import { usePlayerStore } from "../../store/playerStore";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../../App";
import type { SortMode } from "../SearchResultsScreen";

export default function SongsResultsTab({ query, sortMode }: { query: string; sortMode: SortMode }) {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(reset = true) {
    const q = (query ?? "").trim();
    if (!q) {
      setSongs([]);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const nextPage = reset ? 1 : page + 1;
      const results = await searchSongs(q, nextPage);
      setSongs((prev) => (reset ? results : [...prev, ...results]));
      setPage(nextPage);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const sorted = useMemo(() => {
    if (sortMode === "RELEVANCE") return songs;
    const copy = [...songs];
    copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    if (sortMode === "NAME_ZA") copy.reverse();
    return copy;
  }, [songs, sortMode]);

  const showLoader = loading && sorted.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {error ? (
        <Text style={{ color: "crimson", padding: 12 }}>{error}</Text>
      ) : showLoader ? (
        <View style={{ paddingTop: 30 }}>
          <ActivityIndicator />
          <Text style={{ textAlign: "center", marginTop: 10, opacity: 0.7 }}>Searching…</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          onEndReached={() => {
            if (!loading && sorted.length > 0) runSearch(false).catch(() => {});
          }}
          onEndReachedThreshold={0.6}
          renderItem={({ item, index }) => (
            <SongRow
              song={item}
              onPress={async () => {
                await setQueue(sorted, index);
                nav.navigate("Player");
              }}
            />
          )}
          ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} /> : null}
          ListEmptyComponent={
            <View style={{ padding: 16 }}>
              <Text>No results.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}