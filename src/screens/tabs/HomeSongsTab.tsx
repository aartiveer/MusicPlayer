import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { searchSongs } from "../../api/saavn";
import { Song } from "../../models/song";
import SongRow from "../../components/SongRow";
import { usePlayerStore } from "../../store/playerStore";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../../App";

export default function HomeSongsTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const results = await searchSongs("arijit", 1);
        setSongs(results);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ paddingTop: 30 }}>
        <ActivityIndicator />
        <Text style={{ textAlign: "center", marginTop: 10, opacity: 0.7 }}>Loading songs…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ paddingBottom: 120 }}
      renderItem={({ item, index }) => (
        <SongRow
          song={item}
          onPress={async () => {
            await setQueue(songs, index);
            nav.navigate("Player");
          }}
        />
      )}
    />
  );
}