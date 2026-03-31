'use client';

import { useState, useEffect } from 'react';
import { FESTIVAL } from '@/config/festival';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}

const STORAGE_KEY = `${FESTIVAL.id}-achievements`;

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-fave', title: 'Scout Initiate', description: 'Favorite your first artist.', icon: '⭐', isUnlocked: false },
  { id: 'hydration-5', title: 'Water Warrior', description: 'Log 5 glasses of water.', icon: '💧', isUnlocked: false },
  { id: 'quiz-master', title: 'Vibe Architect', description: 'Complete the Vibe Quiz.', icon: '🧠', isUnlocked: false },
  { id: 'survival-ready', title: 'Island Veteran', description: 'Check 5 items off your campsite list.', icon: '🏕️', isUnlocked: false },
  { id: 'night-owl', title: 'Night Owl', description: 'Open the app after midnight.', icon: '🦉', isUnlocked: false },
  { id: 'globetrotter', title: 'Globetrotter', description: 'View artists from 5 different countries.', icon: '🌍', isUnlocked: false },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAchievements(JSON.parse(saved));
    } else {
      setAchievements(DEFAULT_ACHIEVEMENTS);
    }
  }, []);

  const unlockAchievement = (id: string) => {
    const updated = achievements.map(a => 
      a.id === id ? { ...a, isUnlocked: true } : a
    );
    setAchievements(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { achievements, unlockAchievement };
}
