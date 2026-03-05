import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import { searchSongs } from "../api/saavn";
import { Song, pickArtwork } from "../models/song";
import SongRow from "../components/SongRow";
import { usePlayerStore } from "../store/playerStore";
import { RootStackParamList } from "../navigation/RootNavigator";
import ArtistOptionsSheet from "../components/ArtistOptionsSheet";
import SongOptionsSheet from "../components/SongOptionsSheet";


const TopTab = createMaterialTopTabNavigator();
const ORANGE = "#FF6A00";

type ArtistItem = { name: string; art: string | null };
type AlbumItem = { id: string; title: string; art: string | null; artist: string; year: number; songs: number };

export default function HomeScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="musical-notes" size={22} color={ORANGE} />
          <Text style={styles.brand}>Mume</Text>
        </View>

        <Pressable onPress={() => nav.navigate("SearchResults", { query: "arijit" })} hitSlop={10}>
          <Ionicons name="search-outline" size={22} color="#111" />
        </Pressable>
      </View>

      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: ORANGE,
          tabBarInactiveTintColor: "#999",
          tabBarIndicatorStyle: { backgroundColor: ORANGE, height: 3, borderRadius: 99 },
          tabBarLabelStyle: { fontWeight: "900", textTransform: "none" },
        }}
      >
        <TopTab.Screen name="Suggested" component={SuggestedTab} />
        <TopTab.Screen name="Songs" component={SongsTab} />
        <TopTab.Screen name="Artists" component={ArtistsTab} />
        <TopTab.Screen name="Albums" component={AlbumsTab} />
        <TopTab.Screen name="Folders" component={FoldersTab} />
      </TopTab.Navigator>
    </View>
  );
}

/** ---------- Suggested (Figma 5) ---------- */
function SuggestedTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [recent, setRecent] = useState<Song[]>([]);
  const [most, setMost] = useState<Song[]>([]);
  const [artists, setArtists] = useState<ArtistItem[]>([]);

  // cache artist -> artwork to avoid repeat calls
  const artistArtCache = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await searchSongs("weeknd", 1);
      const m = await searchSongs("love", 1);
      if (!alive) return;

      setRecent(r.slice(0, 8));
      setMost(m.slice(0, 8));

      // pick top unique artist names from recent list
      const names: string[] = [];
      for (const s of r) {
        const n = (s.primaryArtists ?? "").split(",").map((x) => x.trim()).filter(Boolean);
        for (const a of n) {
          if (!names.includes(a)) names.push(a);
          if (names.length >= 8) break;
        }
        if (names.length >= 8) break;
      }

      // ✅ fetch unique art per artist (fixes "same image for artists")
      const out: ArtistItem[] = [];
      for (const name of names) {
        if (artistArtCache.current.has(name)) {
          out.push({ name, art: artistArtCache.current.get(name) ?? null });
          continue;
        }
        try {
          const ar = await searchSongs(name, 1);
          const art = ar[0] ? pickArtwork(ar[0]) : null;
          artistArtCache.current.set(name, art);
          out.push({ name, art });
        } catch {
          artistArtCache.current.set(name, null);
          out.push({ name, art: null });
        }
      }

      if (!alive) return;
      setArtists(out);
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 170 }}>
      <SectionHeader title="Recently Played" right="See All" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
        {recent.map((s, idx) => {
          const art = pickArtwork(s);
          return (
            <Pressable key={s.id} style={styles.suggestCard} onPress={() => setQueue(recent, idx).then(() => nav.navigate("Player")).catch(() => {})}>
              {art ? <Image source={{ uri: art }} style={styles.suggestArt} /> : <View style={[styles.suggestArt, { backgroundColor: "#eee" }]} />}
              <Text numberOfLines={2} style={styles.suggestTitle}>{s.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeader title="Artists" right="See All" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 18 }}>
        {artists.map((a) => (
          <Pressable key={a.name} style={{ alignItems: "center", width: 92 }} onPress={() => nav.navigate("ArtistDetails", { artistName: a.name })}>
            {a.art ? <Image source={{ uri: a.art }} style={styles.artistCircle} /> : <View style={[styles.artistCircle, { backgroundColor: "#eee" }]} />}
            <Text numberOfLines={1} style={styles.artistCircleName}>{a.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title="Most Played" right="See All" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
        {most.map((s, idx) => {
          const art = pickArtwork(s);
          return (
            <Pressable key={s.id} style={styles.suggestCard} onPress={() => setQueue(most, idx).then(() => nav.navigate("Player")).catch(() => {})}>
              {art ? <Image source={{ uri: art }} style={styles.suggestArt} /> : <View style={[styles.suggestArt, { backgroundColor: "#eee" }]} />}
              <Text numberOfLines={2} style={styles.suggestTitle}>{s.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}


function SongsTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const [songs, setSongs] = useState<Song[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  // 🔴 Needed for 3-dot menu
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await searchSongs("star", 1);
      if (!alive) return;
      setSongs(res);
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const sorted = useMemo(() => {
    const copy = [...songs];
    copy.sort((a, b) => {
      const an = (a.name ?? "").toLowerCase();
      const bn = (b.name ?? "").toLowerCase();
      return sortAsc ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    return copy;
  }, [songs, sortAsc]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>{sorted.length} songs</Text>

        <Pressable style={styles.metaRightBtn} onPress={() => setSortAsc((v) => !v)}>
          <Text style={styles.metaRightText}>{sortAsc ? "Ascending" : "Descending"}</Text>
          <Ionicons name="swap-vertical" size={16} color="#FF6A00" />
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 170 }}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPressRow={() =>
              setQueue(sorted, index).then(() => nav.navigate("Player")).catch(() => {})
            }
            onPressPlay={() =>
              setQueue(sorted, index).then(() => nav.navigate("Player")).catch(() => {})
            }

            // ✅ SHOW OVERFLOW
            showOverflow

            // ✅ OPEN BOTTOM SHEET
            onPressOverflow={() => {
              setActiveSong(item);
              setSheetOpen(true);
            }}
          />
        )}
      />

      {/* ✅ Song options sheet */}
      <SongOptionsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        song={activeSong}
      />
    </View>
  );
}

/** ---------- Artists (Figma 12 + options (Figma 13)) ---------- */
function ArtistsTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  const [optsOpen, setOptsOpen] = useState(false);
  const [activeArtist, setActiveArtist] = useState<ArtistItem | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await searchSongs("arijit", 1);

      const map = new Map<string, string | null>();
      for (const s of res) {
        const art = pickArtwork(s);
        const names = (s.primaryArtists ?? "").split(",").map((x) => x.trim()).filter(Boolean);
        for (const n of names) if (!map.has(n)) map.set(n, art);
      }

      const list = Array.from(map.entries()).map(([name, art]) => ({ name, art }));
      if (!alive) return;
      setArtists(list);
    })().catch(() => {});
    return () => { alive = false; };
  }, []);

  const sorted = useMemo(() => {
    const copy = [...artists];
    copy.sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    return copy;
  }, [artists, sortAsc]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>{sorted.length} artists</Text>
        <Pressable style={styles.metaRightBtn} onPress={() => setSortAsc((v) => !v)}>
          <Text style={styles.metaRightText}>Date Added</Text>
          <Ionicons name="swap-vertical" size={16} color={ORANGE} />
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(i) => i.name}
        contentContainerStyle={{ paddingBottom: 170 }}
        renderItem={({ item }) => (
          <Pressable style={styles.artistRow} onPress={() => nav.navigate("ArtistDetails", { artistName: item.name })}>
            {item.art ? <Image source={{ uri: item.art }} style={styles.artistAvatar} /> : <View style={[styles.artistAvatar, { backgroundColor: "#eee" }]} />}

            <View style={{ flex: 1 }}>
              <Text style={styles.artistRowName}>{item.name}</Text>
              <Text style={styles.artistRowMeta}>
                1 Album <Text style={{ opacity: 0.5 }}> | </Text> 20 Songs
              </Text>
            </View>

            <Pressable
              hitSlop={10}
              onPress={() => {
                setActiveArtist(item);
                setOptsOpen(true);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#111" style={{ opacity: 0.75 }} />
            </Pressable>
          </Pressable>
        )}
      />

      <ArtistOptionsSheet
        visible={optsOpen}
        onClose={() => setOptsOpen(false)}
        artistName={activeArtist?.name ?? null}
        artistArt={activeArtist?.art ?? null}
        onPlay={() => nav.navigate("ArtistDetails", { artistName: activeArtist?.name ?? "" })}
        onPlayNext={() => Alert.alert("Play Next", "Hook this to your queue logic if needed")}
        onAddQueue={() => Alert.alert("Queue", "Added to queue (demo)")}
        onAddPlaylist={() => Alert.alert("Playlist", "Added to playlist (demo)")}
        onShare={() => Alert.alert("Share", `Share ${activeArtist?.name ?? ""}`)}
      />
    </View>
  );
}

/** ---------- Albums (Figma 15 + opens Figma 16 Album details) ---------- */
function AlbumsTab() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await searchSongs("weeknd", 1);

      const used = new Set<string>();
      const list: AlbumItem[] = [];

      for (const s of res) {
        const key = (s.name ?? "").toLowerCase();
        if (!key || used.has(key)) continue;
        used.add(key);

        const yr = 2020 + (key.length % 5);
        const sc = 10 + (key.length % 12);

        list.push({
          id: s.id,
          title: s.name,
          art: pickArtwork(s),
          artist: (s.primaryArtists ?? "Unknown").split(",")[0]?.trim() || "Unknown",
          year: yr,
          songs: sc,
        });

        if (list.length >= 30) break;
      }

      if (!alive) return;
      setAlbums(list);
    })().catch(() => {});
    return () => { alive = false; };
  }, []);

  const sorted = useMemo(() => {
    const copy = [...albums];
    copy.sort((a, b) => (sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
    return copy;
  }, [albums, sortAsc]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>{sorted.length} albums</Text>
        <Pressable style={styles.metaRightBtn} onPress={() => setSortAsc((v) => !v)}>
          <Text style={styles.metaRightText}>Date Modified</Text>
          <Ionicons name="swap-vertical" size={16} color={ORANGE} />
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 170 }}
        columnWrapperStyle={{ gap: 14 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.albumCard}
            onPress={() =>
              nav.navigate("AlbumDetails", {
                albumId: item.id,
                title: item.title,
                art: item.art,
                artist: item.artist,
                year: item.year,
                songs: item.songs,
              })
            }
          >
            {item.art ? <Image source={{ uri: item.art }} style={styles.albumArt} /> : <View style={[styles.albumArt, { backgroundColor: "#eee" }]} />}

            <View style={styles.albumRowTitle}>
              <Text numberOfLines={1} style={styles.albumTitle}>{item.title}</Text>
              <Pressable hitSlop={10}>
                <Ionicons name="ellipsis-vertical" size={16} color="#111" style={{ opacity: 0.75 }} />
              </Pressable>
            </View>

            <Text numberOfLines={1} style={styles.albumMeta}>
              {item.artist} <Text style={{ opacity: 0.5 }}> | </Text> {item.year}
            </Text>
            <Text style={styles.albumSongs}>{item.songs} songs</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function FoldersTab() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontWeight: "900", opacity: 0.6 }}>Folders coming soon</Text>
    </View>
  );
}

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontSize: 18, fontWeight: "900" },

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

  suggestCard: { width: 150 },
  suggestArt: { width: 150, height: 150, borderRadius: 18, backgroundColor: "#eee" },
  suggestTitle: { marginTop: 10, fontWeight: "900", fontSize: 14, color: "#111" },

  artistCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#eee" },
  artistCircleName: { marginTop: 10, fontWeight: "900", fontSize: 13, color: "#111" },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  metaLeft: { fontWeight: "900", fontSize: 16, color: "#111" },
  metaRightBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaRightText: { fontWeight: "900", color: ORANGE },

  artistRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  artistAvatar: { width: 62, height: 62, borderRadius: 31 },
  artistRowName: { fontWeight: "900", fontSize: 16, color: "#111" },
  artistRowMeta: { marginTop: 6, fontWeight: "800", fontSize: 12, color: "#111", opacity: 0.55 },

  albumCard: { flex: 1, paddingBottom: 16 },
  albumArt: { width: "100%", aspectRatio: 1, borderRadius: 18, backgroundColor: "#eee" },
  albumRowTitle: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  albumTitle: { flex: 1, fontWeight: "900", fontSize: 16, color: "#111" },
  albumMeta: { marginTop: 6, fontWeight: "800", fontSize: 12, opacity: 0.6, color: "#111" },
  albumSongs: { marginTop: 6, fontWeight: "800", fontSize: 12, opacity: 0.6, color: "#111" },
});