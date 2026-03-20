'use client';

import { useFavorites, type FavoriteTier } from '@/hooks/use-favorites';
import { useEffect, useState, useCallback } from 'react';

interface FavoriteButtonProps {
  artistId: string;
}

const SEEN_KEY = 'sziget-2026-seen';

function loadSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveSeenIds(ids: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

export function FavoriteButton({ artistId }: FavoriteButtonProps) {
  const { getFavoriteTier, addFavorite, removeFavorite, isFavorite } = useFavorites([]);
  const [mounted, setMounted] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    setSeenIds(loadSeenIds());
  }, []);

  const handleTierClick = useCallback(
    (tier: FavoriteTier) => {
      const currentTier = getFavoriteTier(artistId);
      if (currentTier === tier) {
        // Clicking the active tier removes the favorite
        removeFavorite(artistId);
      } else {
        // Switch to or set this tier
        addFavorite(artistId, tier);
      }
    },
    [artistId, getFavoriteTier, addFavorite, removeFavorite]
  );

  const toggleSeen = useCallback(() => {
    setSeenIds(prev => {
      const updated = new Set(prev);
      if (updated.has(artistId)) {
        updated.delete(artistId);
      } else {
        updated.add(artistId);
      }
      saveSeenIds(updated);
      return updated;
    });
  }, [artistId]);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="h-14 flex-1 rounded-2xl bg-muted animate-pulse" />
          <div className="h-14 flex-1 rounded-2xl bg-muted animate-pulse" />
        </div>
        <div className="h-14 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const currentTier = getFavoriteTier(artistId);
  const isSeen = seenIds.has(artistId);

  const mustSeeActive = currentTier === 'must_see';
  const interestedActive = currentTier === 'interested';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Two-tier favorite buttons */}
      <div className="flex gap-3">
        {/* MUST SEE */}
        <button
          onClick={() => handleTierClick('must_see')}
          className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
            mustSeeActive
              ? 'bg-[#FAFF00] border-[#FAFF00] text-black shadow-[0_0_20px_rgba(250,255,0,0.4)] scale-[1.02]'
              : 'bg-transparent border-[#FAFF00]/30 text-[#FAFF00]/60 hover:border-[#FAFF00]/70 hover:text-[#FAFF00] hover:bg-[#FAFF00]/5'
          }`}
        >
          <span>⭐</span>
          <span>MUST SEE</span>
        </button>

        {/* INTERESTED */}
        <button
          onClick={() => handleTierClick('interested')}
          className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
            interestedActive
              ? 'bg-[#FF00FF] border-[#FF00FF] text-white shadow-[0_0_20px_rgba(255,0,255,0.35)] scale-[1.02]'
              : 'bg-transparent border-[#FF00FF]/30 text-[#FF00FF]/60 hover:border-[#FF00FF]/70 hover:text-[#FF00FF] hover:bg-[#FF00FF]/5'
          }`}
        >
          <span>🔖</span>
          <span>INTERESTED</span>
        </button>
      </div>

      {/* SAW THIS SET toggle */}
      <button
        onClick={toggleSeen}
        className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
          isSeen
            ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)] scale-[1.01]'
            : 'bg-transparent border-white/15 text-white/40 hover:border-white/40 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        <span className="text-base">✓</span>
        <span>{isSeen ? 'SEEN IT!' : 'MARK AS SEEN'}</span>
      </button>
    </div>
  );
}
