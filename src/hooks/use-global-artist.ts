'use client';

import { useState, useEffect } from 'react';
import { FESTIVAL_IDS, getFestivalConfig } from '@/config/festival-engine';
import type { LineupItem } from '@/types';

export interface EcosystemAppearance {
  festivalId: string;
  festivalName: string;
  artistId: string;
  day: string | null;
  stage: string | null;
  startTime: string | null;
}

export function useGlobalArtist(artistName: string | undefined) {
  const [appearances, setAppearances] = useState<EcosystemAppearance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!artistName) return;

    async function fetchAppearances() {
      setIsLoading(true);
      const results: EcosystemAppearance[] = [];
      
      try {
        await Promise.all(
          FESTIVAL_IDS.map(async (id) => {
            const res = await fetch(`/data/${id}/lineup.json`);
            if (res.ok) {
              const lineup: LineupItem[] = await res.json();
              const match = lineup.find(a => a.artist.toLowerCase() === artistName?.toLowerCase());
              if (match) {
                const config = getFestivalConfig(id);
                results.push({
                  festivalId: id,
                  festivalName: config.name,
                  artistId: match.id,
                  day: match.day ?? null,
                  stage: match.stage ?? null,
                  startTime: match.startTime ?? null
                });
              }
            }
          })
        );
        setAppearances(results);
      } catch (e) {
        console.error('Failed to fetch global appearances', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAppearances();
  }, [artistName]);

  return { appearances, isLoading };
}
