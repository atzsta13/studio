'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { LineupItem } from '@/types';
import { Heart, ChevronRight, X } from 'lucide-react';

interface SerendipityModalProps {
  artist: LineupItem | null;
  onSpinAgain: () => void;
  onClose: () => void;
  onExplore: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (artistId: string) => void;
}

export function SerendipityModal({
  artist,
  onSpinAgain,
  onClose,
  onExplore,
  isFavorite,
  onToggleFavorite,
}: SerendipityModalProps) {
  const [isSpinning, setIsSpinning] = useState(true);

  const handleSpinAgain = () => {
    setIsSpinning(true);
    setTimeout(() => {
      onSpinAgain();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {artist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0a0a0a]/97 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            {/* Spinner (visible during spin phase) */}
            {isSpinning && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.3 }}
                onAnimationComplete={() => setIsSpinning(false)}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
              >
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-64 h-64 rounded-full border-2 border-[#FF00FF]/30"
                />

                {/* Middle ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-48 h-48 rounded-full border-2 border-[#FFED4E]/30"
                />

                {/* Inner ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-32 h-32 rounded-full border-2 border-[#00FFFF]/30"
                />

                {/* Center icon */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="relative z-10 w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center border-2 border-[#FFED4E]"
                >
                  <div className="text-2xl">✨</div>
                </motion.div>

                <motion.p
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute top-1/2 mt-40 text-sm uppercase tracking-widest font-bold text-[#FFED4E]"
                >
                  Scanning Lineup...
                </motion.p>
              </motion.div>
            )}

            {/* Artist Card (revealed after spinning) */}
            {!isSpinning && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#333333]"
              >
                {/* Hero Image */}
                <div className="relative w-full h-72 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                  {artist.imageUrl ? (
                    <Image
                      src={artist.imageUrl}
                      alt={artist.artist}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF00FF]/20 to-[#00FFFF]/20 flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors z-10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Artist Name */}
                  <div>
                    <h2 className="text-3xl font-black italic leading-tight text-white">
                      {artist.artist}
                    </h2>
                  </div>

                  {/* Genres */}
                  {artist.genres && artist.genres.length > 0 && (
                    <p className="text-sm text-gray-400">
                      {artist.genres.slice(0, 3).join(' · ')}
                    </p>
                  )}

                  {/* Vibes */}
                  {artist.vibes && artist.vibes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {artist.vibes.slice(0, 3).map((vibe) => (
                        <span
                          key={vibe}
                          className="text-xs px-3 py-1 bg-[#0a0a0a] text-[#FFED4E] rounded-full"
                        >
                          {vibe}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Day tag */}
                  {artist.day && (
                    <span className="inline-block text-xs px-3 py-1 bg-[#00FFFF]/20 text-[#00FFFF] rounded-full font-bold tracking-wider">
                      {artist.day}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="pt-4 space-y-3">
                    <Link
                      href={`/artist/${artist.id}`}
                      onClick={onExplore}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#FFED4E] hover:bg-white text-black font-black uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Explore
                      <ChevronRight className="w-5 h-5" />
                    </Link>

                    <button
                      onClick={handleSpinAgain}
                      className="w-full px-6 py-3 text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-colors"
                    >
                      Spin Again
                    </button>

                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(artist.id)}
                        className={`w-full px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                          isFavorite
                            ? 'bg-[#FF00FF] text-white hover:bg-[#FF33FF]'
                            : 'bg-[#1a1a1a] border border-[#333333] text-gray-400 hover:border-[#FF00FF] hover:text-[#FF00FF]'
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={isFavorite ? 'currentColor' : 'none'}
                        />
                        {isFavorite ? 'Favorited' : 'Add to Favorites'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
