export type Song = {
  id: string;
  name: string;
  primaryArtists?: string;
  image?: { quality: string; url: string }[];
  downloadUrl?: { quality: string; url: string }[];
};

/**
 * Remove duplicate artist names
 */
export function cleanArtists(artists?: string): string {
  if (!artists) return "Unknown artist";

  const unique = Array.from(
    new Set(
      artists
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    )
  );

  return unique.join(", ");
}

export function pickBestUrl(song: Song): string | null {
  const urls = song.downloadUrl ?? [];

  const q320 = urls.find((u) => u.quality === "320");
  const q160 = urls.find((u) => u.quality === "160");

  return (q320 ?? q160 ?? urls[urls.length - 1])?.url ?? null;
}

export function pickArtwork(song: Song): string | null {
  const imgs = song.image ?? [];
  return (imgs[imgs.length - 1] ?? imgs[0])?.url ?? null;
}