'use client';

import { useMemo, useEffect, useState } from 'react';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';

type LineupItemExtended = LineupItem & { vibes?: string[]; isHeadliner?: boolean };

const allArtists = lineup as unknown as LineupItemExtended[];

const FAVORITES_V2_KEY = 'sziget-2026-favorites-v2';
const FAVORITES_V1_KEY = 'sziget-2026-favorites';
const SEEN_KEY = 'sziget-2026-seen';

interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  subtitle: string;
  check: (favArtists: LineupItemExtended[], seenIds: Set<string>) => boolean;
}

const BADGE_DEFS: BadgeDefinition[] = [
  {
    id: 'loyal_fan',
    emoji: '🎵',
    name: 'LOYAL FAN',
    subtitle: 'Favorite 5+ artists',
    check: (favs) => favs.length >= 5,
  },
  {
    id: 'world_citizen',
    emoji: '🌍',
    name: 'WORLD CITIZEN',
    subtitle: 'Span 5+ different countries',
    check: (favs) => {
      const countries = new Set(favs.map((a) => a.countryCode).filter(Boolean));
      return countries.size >= 5;
    },
  },
  {
    id: 'genre_explorer',
    emoji: '🎭',
    name: 'GENRE EXPLORER',
    subtitle: 'Span 5+ different genres',
    check: (favs) => {
      const genres = new Set(
        favs.flatMap((a) => (a.genres ?? []).filter((g) => g !== 'MUSIC'))
      );
      return genres.size >= 5;
    },
  },
  {
    id: 'headliner_hunter',
    emoji: '⭐',
    name: 'HEADLINER HUNTER',
    subtitle: 'Favorite 3+ headliners',
    check: (favs) => favs.filter((a) => a.isHeadliner).length >= 3,
  },
  {
    id: 'vibe_hunter',
    emoji: '🏄',
    name: 'VIBE HUNTER',
    subtitle: '10+ unique vibes across favorites',
    check: (favs) => {
      const vibes = new Set(favs.flatMap((a) => a.vibes ?? []));
      return vibes.size >= 10;
    },
  },
  {
    id: 'set_witness',
    emoji: '👁',
    name: 'SET WITNESS',
    subtitle: 'Mark 3+ artists as seen',
    check: (_favs, seenIds) => seenIds.size >= 3,
  },
];

function parseFavoriteIds(): string[] {
  try {
    const v2Raw = localStorage.getItem(FAVORITES_V2_KEY);
    if (v2Raw) {
      // v2 format: Record<string, "must_see" | "interested">
      const v2: Record<string, string> = JSON.parse(v2Raw);
      if (v2 && typeof v2 === 'object' && !Array.isArray(v2)) {
        return Object.keys(v2);
      }
    }
  } catch {
    // fall through
  }
  try {
    const v1Raw = localStorage.getItem(FAVORITES_V1_KEY);
    if (v1Raw) {
      // v1 format: plain array of IDs
      const v1 = JSON.parse(v1Raw);
      if (Array.isArray(v1)) return v1 as string[];
    }
  } catch {
    // ignore
  }
  return [];
}

function parseSeenIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as string[];
    }
  } catch {
    // ignore
  }
  return [];
}

export function AchievementBadges() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setFavoriteIds(new Set(parseFavoriteIds()));
    setSeenIds(new Set(parseSeenIds()));
    setIsMounted(true);
  }, []);

  const favArtists = useMemo(
    () => allArtists.filter((a) => favoriteIds.has(a.id)),
    [favoriteIds]
  );

  if (!isMounted) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🏆</span>
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
          Achievements
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {BADGE_DEFS.map((badge) => {
          const unlocked = badge.check(favArtists, seenIds);
          return (
            <div
              key={badge.id}
              className="relative rounded-[2rem] border-2 p-6 transition-all duration-300"
              style={{
                backgroundColor: '#0A0A0A',
                borderColor: unlocked ? '#f5e642' : 'rgba(255,255,255,0.1)',
                opacity: unlocked ? 1 : 0.5,
                boxShadow: unlocked ? '0 0 24px rgba(245,230,66,0.12)' : 'none',
              }}
            >
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] pointer-events-none z-10">
                  <span className="text-3xl opacity-60">🔒</span>
                </div>
              )}
              <div className={unlocked ? '' : 'blur-[1px]'}>
                <div className="text-4xl mb-3">{badge.emoji}</div>
                <h3
                  className="font-black uppercase tracking-widest text-[11px] mb-1"
                  style={{ color: unlocked ? '#f5e642' : '#fff' }}
                >
                  {badge.name}
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-snug mb-3">
                  {badge.subtitle}
                </p>
                {unlocked ? (
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
                    style={{ backgroundColor: 'rgba(57,255,20,0.15)', color: '#39ff14', border: '1px solid rgba(57,255,20,0.3)' }}
                  >
                    UNLOCKED
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-muted-foreground/20">
                    LOCKED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
