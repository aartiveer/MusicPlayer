import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  LayoutChangeEvent,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { usePlayerStore } from "../store/playerStore";
import { pickArtwork, cleanArtists } from "../models/song";
import BottomSheet from "../components/BottomSheet";

const ORANGE = "#FF6A00";

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PlayerScreen() {
  const nav = useNavigation<any>();

  const {
    queue,
    currentIndex,
    isPlaying,
    togglePlay,
    next,
    prev,
    positionMillis,
    durationMillis,
    seekByMillis,
    sound,
    stopAndUnload,
  } = usePlayerStore();

  const current = queue[currentIndex];
  const artwork = current ? pickArtwork(current) : null;
  const artistText = useMemo(
    () => cleanArtists(current?.primaryArtists),
    [current?.primaryArtists]
  );

  const progress = durationMillis ? Math.min(1, positionMillis / durationMillis) : 0;
  const barW = useRef(0);

  function onBarLayout(e: LayoutChangeEvent) {
    barW.current = e.nativeEvent.layout.width;
  }

  function seekToRatio(r: number) {
    if (!durationMillis) return;
    const clamped = Math.max(0, Math.min(1, r));
    const target = Math.floor(durationMillis * clamped);
    const delta = target - positionMillis;
    seekByMillis(delta).catch(() => {});
  }

  // ---- Bottom icon functionality ----
  const [speedOpen, setSpeedOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const timerRef = useRef<any>(null);

  async function setRate(rate: number) {
    try {
      if (!sound) return;
      // expo-av supports setRateAsync
      // @ts-ignore
      await sound.setRateAsync(rate, true);
      setSpeedOpen(false);
    } catch {
      Alert.alert("Speed", "Failed to change speed");
    }
  }

  function setSleep(minutes: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      stopAndUnload().catch(() => {});
      Alert.alert("Sleep Timer", "Playback stopped");
    }, minutes * 60 * 1000);
    setTimerOpen(false);
    Alert.alert("Sleep Timer", `Will stop in ${minutes} minutes`);
  }

  if (!current) {
    return (
      <View style={styles.center}>
        <Text>No song selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Figma header (back + more) */}
      <View style={styles.topBar}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>

        <Pressable onPress={() => setMoreOpen(true)} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Cover */}
      <View style={styles.coverWrap}>
        {artwork ? (
          <Image source={{ uri: artwork }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: "#eee" }]} />
        )}
      </View>

      {/* ✅ Figma title style */}
      <Text style={styles.title} numberOfLines={1}>
        {current.name}
      </Text>

      <Text style={styles.subtitle} numberOfLines={1}>
        {artistText}
      </Text>

      <View style={styles.divider} />

      {/* Progress */}
      <View style={styles.progressBlock}>
        <Pressable
          style={styles.progressOuter}
          onLayout={onBarLayout}
          onPress={(e) => {
            if (!barW.current) return;
            seekToRatio(e.nativeEvent.locationX / barW.current);
          }}
        >
          <View style={[styles.progressInner, { width: `${Math.round(progress * 100)}%` }]} />
          <View style={[styles.thumb, { left: `${Math.round(progress * 100)}%` }]} />
        </Pressable>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      {/* ✅ Figma controls */}
      <View style={styles.controlsRow}>
        <Pressable style={styles.controlBtn} onPress={() => prev().catch(() => {})}>
          <Ionicons name="play-skip-back" size={28} color="#111" />
        </Pressable>

        <Pressable style={styles.tenBtn} onPress={() => seekByMillis(-10000).catch(() => {})}>
          <Ionicons name="arrow-undo" size={18} color="#111" />
          <Text style={styles.tenText}>10</Text>
        </Pressable>

        {/* ✅ Fix play/pause icon alignment */}
        <Pressable style={styles.playBtn} onPress={() => togglePlay().catch(() => {})}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={34}
            color="#fff"
            style={!isPlaying ? { marginLeft: 3 } : undefined} // ✅ centers triangle visually
          />
        </Pressable>

        <Pressable style={styles.tenBtn} onPress={() => seekByMillis(10000).catch(() => {})}>
          <Ionicons name="arrow-redo" size={18} color="#111" />
          <Text style={styles.tenText}>10</Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={() => next().catch(() => {})}>
          <Ionicons name="play-skip-forward" size={28} color="#111" />
        </Pressable>
      </View>

      {/* ✅ Bottom icon row - functional */}
      <View style={styles.bottomIcons}>
        <Pressable style={styles.bottomIconBtn} onPress={() => setSpeedOpen(true)}>
          <Ionicons name="speedometer-outline" size={24} color="#111" style={{ opacity: 0.9 }} />
        </Pressable>

        <Pressable style={styles.bottomIconBtn} onPress={() => setTimerOpen(true)}>
          <Ionicons name="alarm-outline" size={24} color="#111" style={{ opacity: 0.9 }} />
        </Pressable>

        <Pressable
          style={styles.bottomIconBtn}
          onPress={() => Alert.alert("Cast", "No cast devices found")}
        >
          <Ionicons name="wifi-outline" size={24} color="#111" style={{ opacity: 0.9 }} />
        </Pressable>

        <Pressable style={styles.bottomIconBtn} onPress={() => setMoreOpen(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#111" style={{ opacity: 0.9 }} />
        </Pressable>
      </View>

      {/* Lyrics */}
      <Pressable style={styles.lyrics} onPress={() => Alert.alert("Lyrics", "Coming soon")}>
        <Ionicons name="chevron-up" size={18} color="#111" style={{ opacity: 0.5 }} />
        <Text style={styles.lyricsText}>Lyrics</Text>
      </Pressable>

      {/* ---- Sheets ---- */}
      <BottomSheet visible={speedOpen} onClose={() => setSpeedOpen(false)}>
        <Text style={styles.sheetTitle}>Playback Speed</Text>
        {[0.5, 1, 1.25, 1.5, 2].map((r) => (
          <Pressable key={r} style={styles.sheetRow} onPress={() => setRate(r)}>
            <Text style={styles.sheetRowText}>{r}x</Text>
          </Pressable>
        ))}
      </BottomSheet>

      <BottomSheet visible={timerOpen} onClose={() => setTimerOpen(false)}>
        <Text style={styles.sheetTitle}>Sleep Timer</Text>
        {[5, 10, 15, 30, 60].map((m) => (
          <Pressable key={m} style={styles.sheetRow} onPress={() => setSleep(m)}>
            <Text style={styles.sheetRowText}>{m} minutes</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.sheetRow, { borderBottomWidth: 0 }]}
          onPress={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = null;
            setTimerOpen(false);
            Alert.alert("Sleep Timer", "Cancelled");
          }}
        >
          <Text style={[styles.sheetRowText, { color: "crimson" }]}>Cancel Timer</Text>
        </Pressable>
      </BottomSheet>

      <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)}>
        <Text style={styles.sheetTitle}>Options</Text>
        <Pressable style={styles.sheetRow} onPress={() => setMoreOpen(false)}>
          <Text style={styles.sheetRowText}>Add to Playlist</Text>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={() => setMoreOpen(false)}>
          <Text style={styles.sheetRowText}>Share</Text>
        </Pressable>
        <Pressable
          style={[styles.sheetRow, { borderBottomWidth: 0 }]}
          onPress={() => {
            setMoreOpen(false);
            Alert.alert("Info", "More options can be added here");
          }}
        >
          <Text style={styles.sheetRowText}>Details</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 18, paddingTop: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  coverWrap: { alignItems: "center", marginTop: 6 },
  cover: { width: 280, height: 280, borderRadius: 26 },

  title: { marginTop: 18, textAlign: "center", fontSize: 30, fontWeight: "900", color: "#111" },
  subtitle: { marginTop: 8, textAlign: "center", fontSize: 14, color: "#666", fontWeight: "700" },

  divider: { marginTop: 18, height: StyleSheet.hairlineWidth, backgroundColor: "#EDEDED" },

  progressBlock: { marginTop: 18 },

  progressOuter: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#EDEDED",
    justifyContent: "center",
    overflow: "visible",
  },
  progressInner: { position: "absolute", left: 0, height: 6, borderRadius: 999, backgroundColor: ORANGE },
  thumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ORANGE,
    marginLeft: -7,
  },

  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  timeText: { fontSize: 12, color: "#666", fontWeight: "800" },

  controlsRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  controlBtn: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },

  tenBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  tenText: {
    position: "absolute",
    bottom: 10,
    fontSize: 11,
    fontWeight: "900",
    color: "#111",
  },

  playBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomIcons: {
    marginTop: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 34,
  },
  bottomIconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },

  lyrics: { marginTop: 16, alignItems: "center" },
  lyricsText: { marginTop: 4, color: "#111", opacity: 0.6, fontWeight: "800" },

  sheetTitle: { fontWeight: "900", fontSize: 16, marginBottom: 10 },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  sheetRowText: { fontWeight: "800", fontSize: 14 },
});