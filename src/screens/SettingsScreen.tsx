// src/screens/SettingsScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

const ORANGE = "#FF6A00";

function Row({ title, subtitle, value, onChange }: any) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "900" }}>{title}</Text>
        {subtitle ? <Text style={{ marginTop: 6, opacity: 0.65, fontWeight: "800" }}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: ORANGE }} />
    </View>
  );
}

export default function SettingsScreen() {
  const [downloadWifi, setDownloadWifi] = useState(true);
  const [highQuality, setHighQuality] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>

      <Row title="Download on Wi-Fi only" subtitle="Recommended to save data" value={downloadWifi} onChange={setDownloadWifi} />
      <Row title="High quality streaming" subtitle="Prefer 320 kbps when available" value={highQuality} onChange={setHighQuality} />

      <View style={styles.card}>
        <Text style={{ fontWeight: "900" }}>About</Text>
        <Text style={{ marginTop: 6, opacity: 0.65, fontWeight: "800" }}>Lokal Music Player (Assignment)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 14 },
  h1: { fontSize: 28, fontWeight: "900", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee" },
  card: { marginTop: 18, padding: 14, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: "#eee" },
});