import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Song, pickArtwork, cleanArtists } from "../models/song";

const ORANGE = "#FF6A00";

function pseudoDurationSeconds(seed: string) {
  // Stable fake duration: 2:10 → 5:05 range
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const min = 2 * 60 + 10;
  const max = 5 * 60 + 5;
  return min + (h % (max - min + 1));
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} mins`;
}

type Props = {
  song: Song;

  // ✅ current API
  onPressRow: () => void;
  onPressPlay: () => void;

  // optional
  showOverflow?: boolean;
  onPressOverflow?: () => void;

  // ✅ compatibility (some tabs used old prop names)
  onPress?: () => void;
  onPlayPress?: () => void;
};

export default function SongRow(props: Props) {
  const { song } = props;

  const onPressRow = props.onPressRow ?? props.onPress ?? (() => {});
  const onPressPlay = props.onPressPlay ?? props.onPlayPress ?? (() => {});
  const showOverflow = !!props.showOverflow;
  const onPressOverflow = props.onPressOverflow;

  const art = pickArtwork(song);
  const duration = fmtDuration(pseudoDurationSeconds(`${song.id}:${song.name}`));

  return (
    <Pressable onPress={onPressRow} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.artWrap}>
          {art ? <Image source={{ uri: art }} style={styles.art} /> : <View style={[styles.art, { backgroundColor: "#eee" }]} />}
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>
            {song.name}
          </Text>

          {/* Figma: "Artist | 03:50 mins" */}
          <Text numberOfLines={1} style={styles.subtitle}>
            {cleanArtists(song.primaryArtists)} <Text style={{ opacity: 0.45 }}> | </Text>
            {duration}
          </Text>
        </View>
      </View>

      <Pressable onPress={onPressPlay} style={styles.playBtn} hitSlop={10}>
        <Ionicons name="play" size={16} color="#fff" />
      </Pressable>

      {showOverflow ? (
        <Pressable onPress={onPressOverflow} hitSlop={10} style={styles.overflowBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color="#111" style={{ opacity: 0.75 }} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  left: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  artWrap: { width: 52, height: 52, borderRadius: 16, overflow: "hidden" },
  art: { width: 52, height: 52, borderRadius: 16 },
  title: { fontSize: 16, fontWeight: "900" },
  subtitle: { marginTop: 4, fontSize: 12, opacity: 0.65, fontWeight: "700" },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  overflowBtn: { marginLeft: 10, paddingVertical: 6, paddingHorizontal: 2 },
});