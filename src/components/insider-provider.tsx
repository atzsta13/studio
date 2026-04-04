'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FESTIVAL, getFestivalConfig, FestivalConfig } from '@/config/festival';

interface InsiderContextType {
  config: FestivalConfig;
  features: FestivalConfig['features'];
  batterySaver: boolean;
  toggleBatterySaver: () => void;
  getStorageKey: (key: string) => string;
  isOnline: boolean;
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

  useEffect(() => {
    // Initial Load
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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config.id]);

  const toggleBatterySaver = () => {
    const next = !batterySaver;
    setBatterySaver(next);
    localStorage.setItem(`${config.id}-battery-saver`, String(next));
    if (next) {
      document.body.classList.add('battery-saver');
    } else {
      document.body.classList.remove('battery-saver');
    }
  };

  const getStorageKey = (key: string) => `${config.id}-${key}`;

  const value = {
    config,
    features: config.features,
    batterySaver,
    toggleBatterySaver,
    getStorageKey,
    isOnline
  };

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
