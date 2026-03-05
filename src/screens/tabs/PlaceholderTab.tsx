import React from "react";
import { View, Text } from "react-native";

export default function PlaceholderTab({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontWeight: "800", opacity: 0.7 }}>{title}</Text>
    </View>
  );
}