'use client';
import { BASE_PATH } from '@/lib/base-path';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getFestivalConfig, FestivalConfig } from '@/config/festival-engine';
import type { LineupItem } from '@/types';
import { areSlotsOverlapping } from '@/lib/utils';

export type FavoriteTier = 'must_see' | 'interested';

interface InsiderContextType {
  config: FestivalConfig;
  features: FestivalConfig['features'];
  batterySaver: boolean;
  toggleBatterySaver: () => void;
  getStorageKey: (key: string) => string;
  isOnline: boolean;
  
  // Lineup Data
  lineup: LineupItem[];
  isLoading: boolean;
  error: Error | null;

  // Favorites
  favorites: Set<string>;
  allFavoriteIds: Set<string>;
  mustSeeIds: Set<string>;
  interestedIds: Set<string>;
  toggleFavorite: (artistId: string, tier?: FavoriteTier) => void;
  addFavorite: (id: string, tier: FavoriteTier) => void;
  removeFavorite: (id: string) => void;
  getFavoriteTier: (id: string) => FavoriteTier | null;
  isFavorite: (id: string) => boolean;
  conflicts: Set<string>;
}

const InsiderContext = createContext<InsiderContextType | undefined>(undefined);

export function InsiderProvider({ 
  children, 
  festivalId 
}: { 
  children: React.ReactNode,
  festivalId?: string 
}) {
  const config = getFestivalConfig(festivalId);
  const [batterySaver, setBatterySaver] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // --- Lineup Data State ---
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // --- Favorites State ---
  const [tieredFavorites, setTieredFavorites] = useState<Record<string, FavoriteTier>>({});
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  const favKeys = useMemo(() => {
    const id = config.id || 'default';
    return {
      v1: `${id}-favorites`,
      v2: `${id}-favorites-v2`
    };
  }, [config.id]);

  // Initial Load (System & Lineup)
  useEffect(() => {
    // Battery Saver
    const savedBattery = localStorage.getItem(`${config.id}-battery-saver`);
    if (savedBattery === 'true') {
      setBatterySaver(true);
      document.body.classList.add('battery-saver');
    }

    // Connectivity
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Lineup Fetch
    let isMounted = true;
    async function fetchLineup() {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_PATH}/data/${config.id}/lineup.json`);
        if (!response.ok) throw new Error(`Failed to load lineup for ${config.id}`);
        const data = await response.json();
        if (isMounted) {
          setLineup(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchLineup();

    // Favorites Load
    try {
      const v2Raw = localStorage.getItem(favKeys.v2);
      if (v2Raw) {
        setTieredFavorites(JSON.parse(v2Raw));
      } else {
        const v1Raw = localStorage.getItem(favKeys.v1);
        if (v1Raw) {
          const v1Ids: string[] = JSON.parse(v1Raw);
          const migrated: Record<string, FavoriteTier> = {};
          v1Ids.forEach(id => { migrated[id] = 'must_see'; });
          localStorage.setItem(favKeys.v2, JSON.stringify(migrated));
          setTieredFavorites(migrated);
        }
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config.id, favKeys]);

  // --- Actions ---
  const toggleBatterySaver = useCallback(() => {
    setBatterySaver(prev => {
      const next = !prev;
      localStorage.setItem(`${config.id}-battery-saver`, String(next));
      if (next) document.body.classList.add('battery-saver');
      else document.body.classList.remove('battery-saver');
      return next;
    });
  }, [config.id]);

  const getStorageKey = useCallback((key: string) => `${config.id}-${key}`, [config.id]);

  const saveFavorites = useCallback((data: Record<string, FavoriteTier>) => {
    try {
      localStorage.setItem(favKeys.v2, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save favorites', error);
    }
  }, [favKeys]);

  const addFavorite = useCallback((id: string, tier: FavoriteTier) => {
    setTieredFavorites(prev => {
      const updated = { ...prev, [id]: tier };
      saveFavorites(updated);
      return updated;
    });
  }, [saveFavorites]);

  const removeFavorite = useCallback((id: string) => {
    setTieredFavorites(prev => {
      const updated = { ...prev };
      delete updated[id];
      saveFavorites(updated);
      return updated;
    });
  }, [saveFavorites]);

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
      saveFavorites(updated);
      return updated;
    });
  }, [saveFavorites]);

  // --- Derived Favorites ---
  const favorites = useMemo(() => new Set(Object.keys(tieredFavorites)), [tieredFavorites]);
  const allFavoriteIds = favorites;
  const mustSeeIds = useMemo(
    () => new Set(Object.entries(tieredFavorites).filter(([, tier]) => tier === 'must_see').map(([id]) => id)),
    [tieredFavorites]
  );
  const interestedIds = useMemo(
    () => new Set(Object.entries(tieredFavorites).filter(([, tier]) => tier === 'interested').map(([id]) => id)),
    [tieredFavorites]
  );

  // --- Conflict Detection ---
  useEffect(() => {
    const favoritesWithDetails = lineup.filter(item => isFavorite(item.id) && item.startTime && item.endTime);
    const newConflicts = new Set<string>();

    if (favoritesWithDetails.length >= 2) {
      favoritesWithDetails.sort(
        (a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()
      );

      for (let i = 0; i < favoritesWithDetails.length; i++) {
        for (let j = i + 1; j < favoritesWithDetails.length; j++) {
          const favA = favoritesWithDetails[i];
          const favB = favoritesWithDetails[j];

          if (areSlotsOverlapping(favA, favB)) {
            newConflicts.add(favA.id);
            newConflicts.add(favB.id);
          }
        }
      }
    }
    setConflicts(newConflicts);
  }, [tieredFavorites, lineup, isFavorite]);

  const value = useMemo(() => ({
    config,
    features: config.features,
    batterySaver,
    toggleBatterySaver,
    getStorageKey,
    isOnline,
    lineup,
    isLoading,
    error,
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
  }), [
    config, batterySaver, toggleBatterySaver, getStorageKey, isOnline,
    lineup, isLoading, error, favorites, allFavoriteIds, mustSeeIds,
    interestedIds, toggleFavorite, addFavorite, removeFavorite,
    getFavoriteTier, isFavorite, conflicts,
  ]);

  return (
    <InsiderContext.Provider value={value}>
      {children}
    </InsiderContext.Provider>
  );
}

export function useInsider() {
  const context = useContext(InsiderContext);
  if (context === undefined) {
    throw new Error('useInsider must be used within an InsiderProvider');
  }
  return context;
}
