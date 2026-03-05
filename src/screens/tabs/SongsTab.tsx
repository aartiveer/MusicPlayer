import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import SongRow from "../../components/SongRow";
import { searchSongs } from "../../api/saavn";
import { Song } from "../../models/song";
import { usePlayerStore } from "../../store/playerStore";
import { useNavigation } from "@react-navigation/native";

export default function SongsTab({ defaultQuery }: { defaultQuery: string }) {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const setQueue = usePlayerStore((s) => s.setQueue);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const r = await searchSongs(defaultQuery, 1);
        setSongs(r);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [defaultQuery]);

  return (
    <View style={{ flex: 1 }}>
      {err ? <Text style={{ padding: 14, color: "crimson", fontWeight: "800" }}>{err}</Text> : null}

      <FlatList
        data={songs}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 220 }}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPressRow={() => setQueue(songs, index).then(() => nav.navigate("Player")).catch(() => {})}
            onPressPlay={() => setQueue(songs, index).then(() => nav.navigate("Player")).catch(() => {})}
          />
        )}
        ListEmptyComponent={loading ? null : <Text style={{ padding: 14 }}>No songs</Text>}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 18 }} /> : null}
      />
    </View>
  );
}