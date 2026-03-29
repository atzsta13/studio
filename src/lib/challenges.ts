import { FESTIVAL } from '@/config/festival';
import type { LineupItem } from '@/types';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  emoji: string;
  isCompleted: boolean;
}

export const FESTIVAL_DAYS = FESTIVAL.dates.days;

const CHALLENGE_DEFINITIONS = [
  {
    id: 'first_fav',
    title: 'FIRST LOVE',
    description: 'Favorite any artist',
    xpReward: 50,
    emoji: '⭐',
    check: (favArtists: LineupItem[]) => favArtists.length > 0,
  },
  {
    id: 'genre_explorer',
    title: 'GENRE TOURIST',
    description: 'Favorite artists from 3+ different genres',
    xpReward: 75,
    emoji: '🎸',
    check: (favArtists: LineupItem[]) => {
      const genres = new Set(
        favArtists.flatMap((a) => (a.genres ?? []).filter((g) => g !== 'MUSIC'))
      );
      return genres.size >= 3;
    },
  },
  {
    id: 'globe_trotter',
    title: 'GLOBE TROTTER',
    description: 'Favorite artists from 5+ different countries',
    xpReward: 100,
    emoji: '🌍',
    check: (favArtists: LineupItem[]) => {
      const countries = new Set(
        favArtists.map((a) => a.countryCode).filter(Boolean)
      );
      return countries.size >= 5;
    },
  },
  {
    id: 'headliner_fan',
    title: 'HEADLINE HUNTER',
    description: 'Favorite all 6 headliners',
    xpReward: 150,
    emoji: '👑',
    check: (favArtists: LineupItem[]) => {
      // Count artists that are in the top 6 (headliners are typically first 6 in sorted list)
      // For now, assume any artist with significant play time is a headliner
      // A better check: artist.day is non-null (indicates scheduled main stage)
      return favArtists.filter((a) => a.day).length >= 6;
    },
  },
  {
    id: 'vibe_curator',
    title: 'VIBE CURATOR',
    description: 'Favorite 3+ artists sharing the same vibe',
    xpReward: 75,
    emoji: '🔮',
    check: (favArtists: LineupItem[]) => {
      const vibeGroups = new Map<string, number>();
      favArtists.forEach((a) => {
        (a.vibes ?? []).forEach((vibe) => {
          vibeGroups.set(vibe, (vibeGroups.get(vibe) ?? 0) + 1);
        });
      });
      return Array.from(vibeGroups.values()).some((count) => count >= 3);
    },
  },
  {
    id: 'quiz_done',
    title: 'DNA DECODED',
    description: 'Complete the Vibe DNA Quiz',
    xpReward: 50,
    emoji: '🧬',
    check: (_favArtists: LineupItem[], quizCompleted?: boolean) => quizCompleted ?? false,
  },
  {
    id: 'full_week',
    title: 'FULL WEEK WARRIOR',
    description: 'Have at least 1 favorite for every festival day',
    xpReward: 200,
    emoji: '📅',
    check: (favArtists: LineupItem[]) => {
      const daysPresent = new Set(
        favArtists.map((a) => a.day).filter((d) => d && FESTIVAL_DAYS.includes(d))
      );
      return FESTIVAL_DAYS.every((day) => daysPresent.has(day));
    },
  },
];

/**
 * Evaluates challenges based on user's current state.
 * Returns all challenges with completion status.
 */
export function evaluateChallenges(
  favArtists: LineupItem[],
  completedIds: Set<string>,
  quizCompleted: boolean
): Challenge[] {
  return CHALLENGE_DEFINITIONS.map((def) => {
    const isCurrentlyCompleted = def.check(favArtists, quizCompleted);
    // Once completed, challenges stay completed (one-way)
    const isCompleted = completedIds.has(def.id) || isCurrentlyCompleted;

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      xpReward: def.xpReward,
      emoji: def.emoji,
      isCompleted,
    };
  });
}

/**
 * Finds newly completed challenges and calculates XP reward.
 */
export function getNewlyCompletedChallenges(
  challenges: Challenge[],
  previousCompleted: Set<string>
): { challenges: Challenge[]; xpGain: number } {
  const newlyCompleted = challenges.filter(
    (c) => c.isCompleted && !previousCompleted.has(c.id)
  );

  const xpGain = newlyCompleted.reduce((sum, c) => sum + c.xpReward, 0);

  return {
    challenges: newlyCompleted,
    xpGain,
  };
}

/**
 * Calculates rank based on XP.
 */
export function getRankFromXp(xp: number): string {
  const { name } = FESTIVAL;
  return xp >= 2000
    ? `${name} Legend`
    : xp >= 1000
      ? 'Main Stage Hero'
      : xp >= 500
        ? 'Superfan'
        : xp >= 200
          ? 'Festival Explorer'
          : 'Tourist';
}
