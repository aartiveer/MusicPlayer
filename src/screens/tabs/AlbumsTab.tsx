import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from "react-native";
import { searchAlbums, Album } from "../../api/saavn";

function pickImage(a: Album): string | null {
  const imgs = a.image ?? [];
  const last = imgs[imgs.length - 1];
  return (last?.url ?? last?.link ?? imgs[0]?.url ?? imgs[0]?.link ?? null) as string | null;
}

export default function AlbumsTab({ defaultQuery }: { defaultQuery: string }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Album[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const r = await searchAlbums(defaultQuery, 1);
        setItems(r);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load albums");
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
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const img = pickImage(item);
          return (
            <View style={styles.card}>
              {img ? <Image source={{ uri: img }} style={styles.art} /> : <View style={[styles.art, styles.ph]} />}
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
              {item.year ? <Text style={styles.year}>{item.year}</Text> : null}
            </View>
          );
        }}
        ListEmptyComponent={loading ? null : <Text>No albums</Text>}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 18 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  err: { padding: 14, color: "crimson", fontWeight: "800" },
  card: { flex: 1, marginBottom: 18 },
  art: { width: "100%", aspectRatio: 1, borderRadius: 18, backgroundColor: "#f2f2f2" },
  ph: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#eee" },
  name: { marginTop: 8, fontWeight: "900" },
  year: { marginTop: 2, opacity: 0.6, fontWeight: "700" },
});