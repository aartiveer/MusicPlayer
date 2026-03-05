import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "../components/BottomSheet";

const ORANGE = "#FF6A00";

function Row({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={18} color="#111" style={{ width: 24 }} />
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}

export default function ArtistOptionsSheet({
  visible,
  onClose,
  artistName,
  artistArt,
  onPlay,
  onPlayNext,
  onAddQueue,
  onAddPlaylist,
  onShare,
}: {
  visible: boolean;
  onClose: () => void;
  artistName: string | null;
  artistArt?: string | null;
  onPlay?: () => void;
  onPlayNext?: () => void;
  onAddQueue?: () => void;
  onAddPlaylist?: () => void;
  onShare?: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {artistName ? (
        <View style={styles.header}>
          {artistArt ? <Image source={{ uri: artistArt }} style={styles.art} /> : <View style={[styles.art, { backgroundColor: "#eee" }]} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {artistName}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              Artist
            </Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="person-outline" size={18} color={ORANGE} />
          </View>
        </View>
      ) : null}

      <Row icon="play-outline" label="Play" onPress={() => (onPlay?.(), onClose())} />
      <Row icon="play-skip-forward-outline" label="Play Next" onPress={() => (onPlayNext?.(), onClose())} />
      <Row icon="list-outline" label="Add to Playing Queue" onPress={() => (onAddQueue?.(), onClose())} />
      <Row icon="add-circle-outline" label="Add to Playlist" onPress={() => (onAddPlaylist?.(), onClose())} />
      <Row icon="share-social-outline" label="Share" onPress={() => (onShare?.(), onClose())} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    marginBottom: 6,
  },
  art: { width: 52, height: 52, borderRadius: 26 },
  title: { fontWeight: "900", fontSize: 16, color: "#111" },
  sub: { marginTop: 4, opacity: 0.6, fontWeight: "700", fontSize: 12 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,106,0,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  rowText: { fontWeight: "800", fontSize: 14 },
});