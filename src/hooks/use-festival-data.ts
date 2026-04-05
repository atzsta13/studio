'use client';

import { useState, useEffect } from 'react';
import { getFestivalConfig, FestivalConfig } from '@/config/festival-engine';
import type { LineupItem } from '@/types';

interface FestivalData {
  config: FestivalConfig;
  lineup: LineupItem[];
  isLoading: boolean;
  error: Error | null;
}

export function useFestivalData(festivalId: string | undefined): FestivalData {
  const [data, setData] = useState<FestivalData>({
    config: getFestivalConfig(festivalId),
    lineup: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      if (!festivalId) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/data/${festivalId}/lineup.json`);
        if (!response.ok) {
          throw new Error(`Failed to load lineup for ${festivalId}`);
        }
        const lineup = await response.json();
        
        setData({
          config: getFestivalConfig(festivalId),
          lineup,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error('Unknown error'),
        }));
      }
    }

    fetchData();
  }, [festivalId]);

  return data;
}
