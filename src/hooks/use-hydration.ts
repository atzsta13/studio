import { useState, useEffect } from 'react';

export function useHydration(festivalId?: string) {
  const [glassCount, setHydrationCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const STORAGE_KEY = `${festivalId || 'default'}_hydration_v1`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHydrationCount(parseInt(saved, 10));
    setIsLoaded(true);
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, glassCount.toString());
    }
  }, [glassCount, isLoaded, STORAGE_KEY]);

  const addWater = () => setHydrationCount(prev => prev + 1);
  const resetWater = () => setHydrationCount(0);

  return { 
    waterCount: glassCount, 
    addWater, 
    resetWater, 
    isLoaded 
  };
}
