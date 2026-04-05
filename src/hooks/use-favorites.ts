import { useState, useEffect, useCallback, useMemo } from 'react';
import type { LineupItem } from '@/types';

export type FavoriteTier = 'must_see' | 'interested';

export const useFavorites = (lineup: LineupItem[] = [], festivalId?: string) => {
  const [tieredFavorites, setTieredFavorites] = useState<Record<string, FavoriteTier>>({});
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  const keys = useMemo(() => {
    const id = festivalId || 'default';
    return {
      v1: `${id}-favorites`,
      v2: `${id}-favorites-v2`
    };
  }, [festivalId]);

  useEffect(() => {
    try {
      const v2Raw = localStorage.getItem(keys.v2);
      if (v2Raw) {
        setTieredFavorites(JSON.parse(v2Raw));
        return;
      }

      const v1Raw = localStorage.getItem(keys.v1);
      if (v1Raw) {
        const v1Ids: string[] = JSON.parse(v1Raw);
        const migrated: Record<string, FavoriteTier> = {};
        v1Ids.forEach(id => { migrated[id] = 'must_see'; });
        localStorage.setItem(keys.v2, JSON.stringify(migrated));
        setTieredFavorites(migrated);
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  }, [keys]);

  const save = useCallback((data: Record<string, FavoriteTier>) => {
    try {
      localStorage.setItem(keys.v2, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save favorites', error);
    }
  }, [keys]);

  const addFavorite = useCallback((id: string, tier: FavoriteTier) => {
    setTieredFavorites(prev => {
      const updated = { ...prev, [id]: tier };
      save(updated);
      return updated;
    });
  }, [save]);

  const removeFavorite = useCallback((id: string) => {
    setTieredFavorites(prev => {
      const updated = { ...prev };
      delete updated[id];
      save(updated);
      return updated;
    });
  }, [save]);

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
      save(updated);
      return updated;
    });
  }, [save]);

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
