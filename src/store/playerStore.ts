// src/store/playerStore.ts
import { create } from "zustand";
import { Audio } from "expo-av";
import { Song, pickBestUrl } from "../models/song";
import { getSongById } from "../api/saavn";

type PlayerState = {
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;

  positionMillis: number;
  durationMillis: number;

  sound: Audio.Sound | null;

  setQueue: (songs: Song[], startIndex?: number) => Promise<void>;
  playAt: (index: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seekByMillis: (deltaMs: number) => Promise<void>;
  stopAndUnload: () => Promise<void>;
};

async function unloadSound(sound: Audio.Sound | null) {
  try {
    if (sound) await sound.unloadAsync();
  } catch {}
}

function normalizeAudioUrl(url: string) {
  return url.replace(/^http:\/\//i, "https://").trim();
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  sound: null,

  setQueue: async (songs, startIndex = 0) => {
    set({ queue: songs, currentIndex: startIndex });
    await get().playAt(startIndex);
  },

  playAt: async (index) => {
    const { queue, sound } = get();
    const base = queue[index];
    if (!base) return;

    // Get normalized detailed song WITHOUT losing base fields
    const detailed = await getSongById(base.id, base);

    // Write back detailed (safe normalized) into queue
    set((state) => {
      const nextQueue = [...state.queue];
      nextQueue[index] = detailed;
      return { queue: nextQueue, currentIndex: index };
    });

    const rawUrl = pickBestUrl(detailed);
    if (!rawUrl) throw new Error("No playable URL found for this song.");

    const url = normalizeAudioUrl(rawUrl);

    await unloadSound(sound);

    const newSound = new Audio.Sound();
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      set({
        isPlaying: status.isPlaying,
        positionMillis: status.positionMillis ?? 0,
        durationMillis: status.durationMillis ?? 0,
      });

      if (status.didJustFinish) get().next().catch(() => {});
    });

    await newSound.loadAsync(
      { uri: url },
      { shouldPlay: true, progressUpdateIntervalMillis: 400 }
    );

    // Force play (more reliable)
    try {
      await newSound.playAsync();
    } catch {}

    set({ sound: newSound, isPlaying: true });
  },

  togglePlay: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;
    if (isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
  },

  next: async () => {
    const { queue, currentIndex } = get();
    if (!queue.length) return;
    await get().playAt((currentIndex + 1) % queue.length);
  },

  prev: async () => {
    const { queue, currentIndex } = get();
    if (!queue.length) return;
    await get().playAt((currentIndex - 1 + queue.length) % queue.length);
  },

  seekByMillis: async (deltaMs) => {
    const { sound, positionMillis, durationMillis } = get();
    if (!sound) return;

    const nextPos = Math.max(0, Math.min(positionMillis + deltaMs, durationMillis || 0));
    await sound.setPositionAsync(nextPos);
  },

  stopAndUnload: async () => {
    const { sound } = get();
    await unloadSound(sound);
    set({ sound: null, isPlaying: false, positionMillis: 0, durationMillis: 0 });
  },
}));