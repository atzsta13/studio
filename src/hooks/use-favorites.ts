'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LineupItem } from '@/types';

const FAVORITES_KEY = 'sziget-2026-favorites';

export const useFavorites = (lineup: LineupItem[] = []) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
    }
  }, []);

  const toggleFavorite = useCallback((artistId: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(artistId)) {
        newFavorites.delete(artistId);
      } else {
        newFavorites.add(artistId);
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
      } catch (error) {
        console.error("Failed to save favorites to localStorage", error);
      }
      return newFavorites;
    });
  }, []);

  useEffect(() => {
    const favoritesWithDetails = lineup.filter(item => favorites.has(item.id));
    const newConflicts = new Set<string>();

    if (favoritesWithDetails.length < 2) {
      setConflicts(newConflicts);
      return;
    }

    favoritesWithDetails.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    for (let i = 0; i < favoritesWithDetails.length; i++) {
      for (let j = i + 1; j < favoritesWithDetails.length; j++) {
        const favA = favoritesWithDetails[i];
        const favB = favoritesWithDetails[j];

        const startA = new Date(favA.startTime).getTime();
        const endA = new Date(favA.endTime).getTime();
        const startB = new Date(favB.startTime).getTime();
        const endB = new Date(favB.endTime).getTime();

        if (startA < endB && startB < endA) {
          newConflicts.add(favA.id);
          newConflicts.add(favB.id);
        }
      }
    }
    setConflicts(newConflicts);
  }, [favorites, lineup]);

  return { favorites, toggleFavorite, conflicts };
};
