import React, { useEffect, useState } from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import RootNavigator, { RootStackParamList } from "./src/navigation/RootNavigator";
import MiniPlayer from "./src/components/MiniPlayer";
import { setupAudioMode } from "./src/player/audio";

const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>("Tabs");

  useEffect(() => {
    setupAudioMode().catch(() => {});
  }, []);

  const updateRouteName = () => {
    if (!navigationRef.isReady()) return;
    const name = navigationRef.getCurrentRoute()?.name ?? "Tabs";
    setCurrentRoute(name);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={updateRouteName} onStateChange={updateRouteName}>
        <RootNavigator />

        {/* ✅ Hide MiniPlayer on Player screen (Figma behavior) */}
        {currentRoute !== "Player" && <MiniPlayer />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}