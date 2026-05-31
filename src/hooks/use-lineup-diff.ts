'use client';
import { BASE_PATH } from '@/lib/base-path';

import { useState, useEffect, useMemo } from 'react';
import type { LineupItem } from '@/types';

interface LineupDiff {
  newArrivals: LineupItem[];
  returningHeroes: LineupItem[];
  genreShifts: Array<{ genre: string; diff: number; current: number }>;
  isLoading: boolean;
}

export function useLineupDiff(festivalId: string, currentLineup: LineupItem[]): LineupDiff {
  const [previousLineup, setPreviousLineup] = useState<LineupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrevious() {
      if (!festivalId || currentLineup.length === 0) return;
      
      try {
        // Try to load 2025 data specifically for Sziget, or generic previous
        const response = await fetch(`${BASE_PATH}/data/${festivalId}/lineup_2025.json`);
        if (response.ok) {
          const data = await response.json();
          setPreviousLineup(data);
        }
      } catch (err) {
        console.error('Failed to load previous year lineup', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrevious();
  }, [festivalId, currentLineup.length]);

  const diff = useMemo(() => {
    if (currentLineup.length === 0 || previousLineup.length === 0) {
      return { newArrivals: [], returningHeroes: [], genreShifts: [] };
    }

    const previousNames = new Set(previousLineup.map(a => a.artist.toLowerCase().trim()));

    const newArrivals = currentLineup.filter(a => !previousNames.has(a.artist.toLowerCase().trim()));
    const returningHeroes = currentLineup.filter(a => previousNames.has(a.artist.toLowerCase().trim()));

    // Genre Analysis
    const getGenreStats = (lineup: LineupItem[]) => {
      const stats: Record<string, number> = {};
      lineup.forEach(a => {
        a.genres?.forEach(g => {
          if (g === 'MUSIC') return;
          stats[g] = (stats[g] || 0) + 1;
        });
      });
      return stats;
    };

    const currentStats = getGenreStats(currentLineup);
    const previousStats = getGenreStats(previousLineup);

    const allGenres = Array.from(new Set([...Object.keys(currentStats), ...Object.keys(previousStats)]));
    const genreShifts = allGenres.map(genre => ({
      genre,
      current: currentStats[genre] || 0,
      diff: (currentStats[genre] || 0) - (previousStats[genre] || 0)
    }))
    .filter(s => s.diff !== 0)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 10);

    return { newArrivals, returningHeroes, genreShifts };
  }, [currentLineup, previousLineup]);

  return { ...diff, isLoading };
}
