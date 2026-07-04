'use client';

import { useMemo } from 'react';
import type { LineupItem } from '@/types';
import { areSlotsOverlapping } from '@/lib/utils';

export function useClashResolver(favorites: LineupItem[]) {
  const clashes = useMemo(() => {
    const result: { a: LineupItem, b: LineupItem }[] = [];
    
    for (let i = 0; i < favorites.length; i++) {
      for (let j = i + 1; j < favorites.length; j++) {
        const a = favorites[i];
        const b = favorites[j];
        
        if (areSlotsOverlapping(a, b)) {
          result.push({ a, b });
        }
      }
    }
    return result;
  }, [favorites]);

  return clashes;
}
