'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sziget_hydration_v1';

export function useHydration() {
  const [waterCount, setWaterAmount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setWaterAmount(parseInt(saved, 10));
    setIsLoaded(true);
  }, []);

  const addWater = () => {
    const newVal = waterCount + 1;
    setWaterAmount(newVal);
    localStorage.setItem(STORAGE_KEY, newVal.toString());
  };

  const resetWater = () => {
    setWaterAmount(0);
    localStorage.setItem(STORAGE_KEY, '0');
  };

  return { waterCount, addWater, resetWater, isLoaded };
}
