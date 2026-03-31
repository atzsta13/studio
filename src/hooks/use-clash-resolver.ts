'use client';

import { useMemo } from 'react';
import type { LineupItem } from '@/types';

export function useClashResolver(favorites: LineupItem[]) {
  const clashes = useMemo(() => {
    const result: { a: LineupItem, b: LineupItem }[] = [];
    
    for (let i = 0; i < favorites.length; i++) {
      for (let j = i + 1; j < favorites.length; j++) {
        const a = favorites[i];
        const b = favorites[j];
        
        if (a.day === b.day && a.startTime && b.startTime && a.endTime && b.endTime) {
          const startA = new Date(a.startTime).getTime();
          const endA = new Date(a.endTime).getTime();
          const startB = new Date(b.startTime).getTime();
          const endB = new Date(b.endTime).getTime();
          
          if (startA < endB && startB < endA) {
            result.push({ a, b });
          }
        }
      }
    }
    return result;
  }, [favorites]);

  return clashes;
}
