import { LineupItem } from '@/types';

/**
 * Selects a random artist from the lineup, excluding favorited and recently-spun artists.
 * Falls back to all unfavorited artists, then all artists if needed.
 */
export function getRandomUnfavoritedArtist(
  allArtists: LineupItem[],
  favoritedIds: Set<string>,
  recentlySpunIds: Set<string>
): LineupItem | null {
  if (allArtists.length === 0) return null;

  // First pool: unfavorited + not recently spun
  let pool = allArtists.filter(
    (a) => !favoritedIds.has(a.id) && !recentlySpunIds.has(a.id)
  );

  // Fallback 1: unfavorited artists (if all have been spun)
  if (pool.length === 0) {
    pool = allArtists.filter((a) => !favoritedIds.has(a.id));
  }

  // Fallback 2: any artist (if all are favorited)
  if (pool.length === 0) {
    pool = allArtists;
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  recentlySpunIds.add(selected.id);

  return selected;
}
