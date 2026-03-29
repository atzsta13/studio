import { useState, useEffect, useCallback } from 'react';
import type { LineupItem } from '@/types';
import { FESTIVAL } from '@/config/festival';

const FAVORITES_KEY_V1 = `${FESTIVAL.id}-favorites`;
const FAVORITES_KEY_V2 = `${FESTIVAL.id}-favorites-v2`;

export type FavoriteTier = 'must_see' | 'interested';

function loadTieredFavorites(): Record<string, FavoriteTier> {
  try {
    const v2Raw = localStorage.getItem(FAVORITES_KEY_V2);
    if (v2Raw) {
      return JSON.parse(v2Raw) as Record<string, FavoriteTier>;
    }

    // Migration: treat all v1 favorites as "must_see"
    const v1Raw = localStorage.getItem(FAVORITES_KEY_V1);
    if (v1Raw) {
      const v1Ids: string[] = JSON.parse(v1Raw);
      const migrated: Record<string, FavoriteTier> = {};
      v1Ids.forEach(id => { migrated[id] = 'must_see'; });
      localStorage.setItem(FAVORITES_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch (error) {
    console.error('Failed to load favorites from localStorage', error);
  }
  return {};
}

function saveTieredFavorites(data: Record<string, FavoriteTier>) {
  try {
    localStorage.setItem(FAVORITES_KEY_V2, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save favorites to localStorage', error);
  }
}

export const useFavorites = (lineup: LineupItem[] = []) => {
  const [tieredFavorites, setTieredFavorites] = useState<Record<string, FavoriteTier>>({});
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTieredFavorites(loadTieredFavorites());
  }, []);

  const addFavorite = useCallback((id: string, tier: FavoriteTier) => {
    setTieredFavorites(prev => {
      const updated = { ...prev, [id]: tier };
      saveTieredFavorites(updated);
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setTieredFavorites(prev => {
      const updated = { ...prev };
      delete updated[id];
      saveTieredFavorites(updated);
      return updated;
    });
  }, []);

  const getFavoriteTier = useCallback(
    (id: string): FavoriteTier | null => tieredFavorites[id] ?? null,
    [tieredFavorites]
  );

  const isFavorite = useCallback(
    (id: string): boolean => id in tieredFavorites,
    [tieredFavorites]
  );

  const toggleFavorite = useCallback((artistId: string, tier: FavoriteTier = 'interested') => {
    setTieredFavorites(prev => {
      const updated = { ...prev };
      if (artistId in updated) {
        delete updated[artistId];
      } else {
        updated[artistId] = tier;
      }
      saveTieredFavorites(updated);
      return updated;
    });
  }, []);

  // Derived sets
  const favorites = new Set(Object.keys(tieredFavorites));
  const allFavoriteIds = favorites;
  const mustSeeIds = new Set(
    Object.entries(tieredFavorites)
      .filter(([, tier]) => tier === 'must_see')
      .map(([id]) => id)
  );
  const interestedIds = new Set(
    Object.entries(tieredFavorites)
      .filter(([, tier]) => tier === 'interested')
      .map(([id]) => id)
  );

  // Conflict detection
  useEffect(() => {
    const favoritesWithDetails = lineup.filter(item => isFavorite(item.id) && item.startTime && item.endTime);
    const newConflicts = new Set<string>();

    if (favoritesWithDetails.length < 2) {
      setConflicts(newConflicts);
      return;
    }

    favoritesWithDetails.sort(
      (a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()
    );

    for (let i = 0; i < favoritesWithDetails.length; i++) {
      for (let j = i + 1; j < favoritesWithDetails.length; j++) {
        const favA = favoritesWithDetails[i];
        const favB = favoritesWithDetails[j];

        const startA = new Date(favA.startTime!).getTime();
        const endA = new Date(favA.endTime!).getTime();
        const startB = new Date(favB.startTime!).getTime();
        const endB = new Date(favB.endTime!).getTime();

        if (startA < endB && startB < endA) {
          newConflicts.add(favA.id);
          newConflicts.add(favB.id);
        }
      }
    }
    setConflicts(newConflicts);
  }, [tieredFavorites, lineup, isFavorite]);

  return {
    favorites,
    allFavoriteIds,
    mustSeeIds,
    interestedIds,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    getFavoriteTier,
    isFavorite,
    conflicts,
  };
};
