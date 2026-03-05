import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "./BottomSheet";
import { Song, pickArtwork, cleanArtists } from "../models/song";

const ORANGE = "#FF6A00";

function Row({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={18} color="#111" style={{ width: 24 }} />
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}

export default function SongOptionsSheet({
  visible,
  onClose,
  song,
}: {
  visible: boolean;
  onClose: () => void;
  song: Song | null;
}) {
  const art = song ? pickArtwork(song) : null;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {song ? (
        <View style={styles.header}>
          {art ? <Image source={{ uri: art }} style={styles.art} /> : <View style={[styles.art, { backgroundColor: "#eee" }]} />}

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.title}>
              {song.name}
            </Text>
            <Text numberOfLines={1} style={styles.sub}>
              {cleanArtists(song.primaryArtists)}
            </Text>
          </View>

          <Pressable style={styles.heart}>
            <Ionicons name="heart-outline" size={20} color={ORANGE} />
          </Pressable>
        </View>
      ) : null}

      <View style={{ marginTop: 4 }}>
        <Row icon="play-outline" label="Play Next" onPress={onClose} />
        <Row icon="list-outline" label="Add to Playing Queue" onPress={onClose} />
        <Row icon="add-circle-outline" label="Add to Playlist" onPress={onClose} />
        <Row icon="albums-outline" label="Go to Album" onPress={onClose} />
        <Row icon="person-outline" label="Go to Artist" onPress={onClose} />
        <Row icon="information-circle-outline" label="Details" onPress={onClose} />
        <Row icon="notifications-outline" label="Set as Ringtone" onPress={onClose} />
        <Row icon="ban-outline" label="Add to Blacklist" onPress={onClose} />
        <Row icon="share-social-outline" label="Share" onPress={onClose} />
        <Row icon="trash-outline" label="Delete from Device" onPress={onClose} />
      </View>
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
  },
  art: { width: 52, height: 52, borderRadius: 14 },
  title: { fontWeight: "900", fontSize: 16 },
  sub: { marginTop: 4, opacity: 0.6, fontWeight: "700", fontSize: 12 },
  heart: {
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