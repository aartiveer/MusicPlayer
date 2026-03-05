import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from "react-native";
import { searchArtists, Artist } from "../../api/saavn";

function pickImage(a: Artist): string | null {
  const imgs = a.image ?? [];
  const last = imgs[imgs.length - 1];
  return (last?.url ?? last?.link ?? imgs[0]?.url ?? imgs[0]?.link ?? null) as string | null;
}

export default function ArtistsTab({ defaultQuery }: { defaultQuery: string }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Artist[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const r = await searchArtists(defaultQuery, 1);
        setItems(r);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load artists");
      } finally {
        setLoading(false);
      }
    })();
  }, [defaultQuery]);

  return (
    <View style={{ flex: 1 }}>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        numColumns={3}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const img = pickImage(item);
          return (
            <View style={styles.card}>
              {img ? <Image source={{ uri: img }} style={styles.avatar} /> : <View style={[styles.avatar, styles.ph]} />}
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={loading ? null : <Text>No artists</Text>}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 18 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  err: { padding: 14, color: "crimson", fontWeight: "800" },
  card: { flex: 1, alignItems: "center", marginBottom: 18 },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: "#f2f2f2" },
  ph: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#eee" },
  name: { marginTop: 8, fontWeight: "900", maxWidth: 100, opacity: 0.85 },
});