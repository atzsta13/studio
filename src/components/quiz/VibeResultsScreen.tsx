'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LineupItem } from '@/types';
import { Heart, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

interface VibeResultsScreenProps {
  results: LineupItem[];
  onRetake: () => void;
  onFavorite: (artistId: string) => void;
  onSaveAll: (artistIds: string[]) => void;
}

export function VibeResultsScreen({
  results,
  onRetake,
  onFavorite,
  onSaveAll,
}: VibeResultsScreenProps) {
  const haptic = useHaptic();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleToggleFavorite = (id: string) => {
    haptic.favoriteTap();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    onFavorite(id);
  };

  const handleSaveAll = () => {
    haptic.successBurst();
    results.forEach((artist) => {
      onFavorite(artist.id);
    });
    onSaveAll(results.map((a) => a.id));
  };

  const handleRetake = () => {
    haptic.lightTap();
    onRetake();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/vibe-quiz" className="p-2 hover:bg-[#1a1a1a] rounded-lg transition">
            <ChevronLeft className="w-6 h-6 text-accent" />
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            Your Sound
          </h1>
          <span className="text-sm text-gray-400 px-4 py-2 bg-[#1a1a1a] rounded-full">
            {results.length} matches
          </span>
        </div>

        {/* Results */}
        <div className="space-y-4 mb-8">
          {results.map((artist, index) => (
            <div
              key={artist.id}
              className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4 hover:border-[#FFED4E] transition-colors group"
            >
              <div className="flex gap-4">
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-accent text-black font-bold text-lg">
                  #{index + 1}
                </div>

                {/* Artist Image */}
                {artist.imageUrl && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#0a0a0a]">
                    <Image
                      src={artist.imageUrl}
                      alt={artist.artist}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">
                    {artist.artist}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {artist.genres?.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="text-xs px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-gray-400"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => handleToggleFavorite(artist.id)}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                    favorites.has(artist.id)
                      ? 'bg-primary text-white'
                      : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                </button>
              </div>

              {/* Vibes */}
              {artist.vibes && artist.vibes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {artist.vibes.slice(0, 4).map((vibe) => (
                    <span
                      key={vibe}
                      className="text-xs px-2 py-1 bg-card text-accent rounded"
                    >
                      {vibe}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveAll}
            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wide"
          >
            Save All as Favorites
          </button>
          <button
            onClick={handleRetake}
            className="flex-1 px-6 py-3 bg-[#1a1a1a] border border-[#333333] text-white font-semibold rounded-lg hover:border-[#FFED4E] transition-colors uppercase tracking-wide"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
