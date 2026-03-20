'use client';

import { useEffect, useState } from 'react';
import type { LineupItem } from '@/types';
import type { Challenge } from '@/lib/challenges';
import { evaluateChallenges, getNewlyCompletedChallenges } from '@/lib/challenges';

const CHALLENGES_KEY = 'sziget-2026-challenges';
const CHALLENGES_XP_KEY = 'sziget-2026-challenges-xp';

export function useChallenges(favArtists: LineupItem[], quizCompleted: boolean) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeXp, setChallengeXp] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Load persisted challenge completion state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHALLENGES_KEY);
      const xpSaved = localStorage.getItem(CHALLENGES_XP_KEY);
      const completedIds = saved ? new Set(JSON.parse(saved)) : new Set<string>();
      const xp = xpSaved ? parseInt(xpSaved) : 0;

      const evaluated = evaluateChallenges(favArtists, completedIds, quizCompleted);
      setChallenges(evaluated);
      setChallengeXp(xp);
      setIsMounted(true);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setIsMounted(true);
    }
  }, []);

  // Evaluate challenges whenever favorites or quiz changes
  useEffect(() => {
    if (!isMounted) return;

    try {
      const saved = localStorage.getItem(CHALLENGES_KEY);
      const completedIds = saved ? new Set(JSON.parse(saved)) : new Set<string>();

      const evaluated = evaluateChallenges(favArtists, completedIds, quizCompleted);
      const { challenges: newlyDone, xpGain } = getNewlyCompletedChallenges(
        evaluated,
        completedIds
      );

      // Update persisted state if there are new completions
      if (newlyDone.length > 0) {
        const updatedIds = Array.from(
          new Set([...completedIds, ...newlyDone.map((c) => c.id)])
        );
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify(updatedIds));

        const newXp = challengeXp + xpGain;
        localStorage.setItem(CHALLENGES_XP_KEY, newXp.toString());
        setChallengeXp(newXp);
      }

      setChallenges(evaluated);
    } catch (error) {
      console.error('Failed to evaluate challenges:', error);
    }
  }, [favArtists, quizCompleted, isMounted, challengeXp]);

  return {
    challenges,
    challengeXp,
    isMounted,
  };
}
