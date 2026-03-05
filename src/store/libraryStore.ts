// src/store/libraryStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Song } from "../models/song";

type Playlist = { id: string; name: string; songs: Song[] };

type LibraryState = {
  favorites: Song[];
  playlists: Playlist[];

  toggleFavorite: (song: Song) => void;
  isFavorite: (id: string) => boolean;

  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      playlists: [{ id: "default", name: "My Playlist", songs: [] }],

      toggleFavorite: (song) => {
        const favs = get().favorites;
        const exists = favs.some((s) => s.id === song.id);
        set({ favorites: exists ? favs.filter((s) => s.id !== song.id) : [song, ...favs] });
      },

      isFavorite: (id) => get().favorites.some((s) => s.id === id),

      createPlaylist: (name) => {
        const id = String(Date.now());
        set({ playlists: [{ id, name, songs: [] }, ...get().playlists] });
      },

      addToPlaylist: (playlistId, song) => {
        const pls = get().playlists.map((p) => {
          if (p.id !== playlistId) return p;
          const exists = p.songs.some((s) => s.id === song.id);
          return exists ? p : { ...p, songs: [song, ...p.songs] };
        });
        set({ playlists: pls });
      },
    }),
    {
      name: "library-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);