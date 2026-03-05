// src/api/saavn.ts
import { Song } from "../models/song";

const BASE = "https://saavn.sumit.co";

type AnyObj = Record<string, any>;

function toArtistsString(raw: any): string | undefined {
  if (!raw) return undefined;

  // already a string
  if (typeof raw === "string") return raw.trim() || undefined;

  // array of strings or objects
  if (Array.isArray(raw)) {
    const names = raw
      .map((x) => {
        if (!x) return "";
        if (typeof x === "string") return x;
        if (typeof x === "object") return x.name || x.title || "";
        return "";
      })
      .map((s) => String(s).trim())
      .filter(Boolean);
    return names.length ? names.join(", ") : undefined;
  }

  // object shapes
  if (typeof raw === "object") {
    // some APIs return { primary: [...], featured: [...] }
    if (Array.isArray(raw.primary) || Array.isArray(raw.featured) || Array.isArray(raw.all)) {
      const combined = ([] as any[])
        .concat(raw.primary || [])
        .concat(raw.featured || [])
        .concat(raw.all || []);
      return toArtistsString(combined);
    }

    // sometimes artists: { name: "..."}
    if (raw.name) return String(raw.name).trim() || undefined;
  }

  return undefined;
}

function normalizeSong(raw: any, fallback?: Song): Song {
  const r: AnyObj = raw?.data ?? raw;

  const id = String(r?.id ?? fallback?.id ?? "");
  const name =
    (typeof r?.name === "string" && r.name) ||
    (typeof r?.title === "string" && r.title) ||
    (typeof fallback?.name === "string" && fallback.name) ||
    "Unknown";

  // primaryArtists can come in MANY shapes
  const primaryArtists =
    toArtistsString(r?.primaryArtists) ||
    toArtistsString(r?.artists) ||
    toArtistsString(r?.artist) ||
    fallback?.primaryArtists ||
    undefined;

  const image = Array.isArray(r?.image) ? r.image : fallback?.image;
  const downloadUrl = Array.isArray(r?.downloadUrl) ? r.downloadUrl : fallback?.downloadUrl;

  return {
    id,
    name,
    primaryArtists,
    image,
    downloadUrl,
  };
}

type SearchSongsResponse = {
  data?: {
    results?: any[];
  };
};

export async function searchSongs(query: string, page: number): Promise<Song[]> {
  const limit = 20;
  const url = `${BASE}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);

  const json = (await res.json()) as SearchSongsResponse;
  const results = json?.data?.results ?? [];
  return results.map((r) => normalizeSong(r));
}

export async function getSongById(id: string, fallback?: Song): Promise<Song> {
  const url = `${BASE}/api/songs/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Song fetch failed: ${res.status}`);

  const json = await res.json();

  // some APIs return { data: {...} } and some return { data: [..] }
  const data = (json as any)?.data ?? json;
  const raw = Array.isArray(data) ? data[0] : data;

  return normalizeSong(raw, fallback);
}