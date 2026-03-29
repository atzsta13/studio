import { useState, useEffect } from 'react';
import { FESTIVAL } from '@/config/festival';

const STORAGE_KEY = `${FESTIVAL.id}_hydration_v1`;

export function useHydration() {
  const [glassCount, setHydrationCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHydrationCount(parseInt(saved, 10));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, glassCount.toString());
    }
  }, [glassCount, isLoaded]);

  return { glassCount, setHydrationCount };
}
