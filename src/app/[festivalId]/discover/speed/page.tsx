'use client';
import { useInsider } from '@/components/layout/insider-provider';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { X, Heart, ChevronLeft, Music, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHaptic } from '@/hooks/use-haptic';

export default function SpeedDiscoveryPage() {
  const haptic = useHaptic();
  const router = useRouter();
  const { festivalId } = useParams() as { festivalId: string };
  const { lineup: rawLineup, config } = useInsider();
  const allArtists = useMemo(() => rawLineup.map(a => ({
    ...a,
    vibes: a.vibes ?? [],
    returningHero: !!a.returningHero,
  })), [rawLineup]);
  const { toggleFavorite, isFavorite } = useInsider();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  
  // Filter for artists not already favorited, starting from a random point
  const pool = useMemo(() => {
    return allArtists
      .filter(a => !isFavorite(a.id))
      .sort(() => Math.random() - 0.5);
  }, [allArtists, isFavorite]);

  const currentArtist = pool[currentIndex];

  const handleNext = (isFav: boolean) => {
    if (isFav && currentArtist) {
      haptic.favoriteTap();
      toggleFavorite(currentArtist.id);
    } else {
      haptic.lightTap();
    }
    
    setDirection(isFav ? 1 : -1);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(0);
    }, 200);
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const heartScale = useTransform(x, [0, 150], [0, 1.5]);
  const xScale = useTransform(x, [0, -150], [0, 1.5]);

  if (!currentArtist || currentIndex >= pool.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black">
        <Sparkles className="w-16 h-16 mb-6" style={{ color: config.theme.accentHex }} />
        <h1 className="text-4xl font-black mb-4 uppercase italic">YOU&apos;VE SEEN IT ALL!</h1>
        <p className="text-muted-foreground mb-8 max-w-xs">You processed the entire lineup. Time to head to {config.name}.</p>
        <Button 
          variant="outline" 
          className="border-2 font-bold uppercase italic"
          onClick={() => router.push(`/${festivalId}/discover`)}
        >
          BACK TO GRID
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden touch-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Speed Discovery</span>
          <span className="text-xs font-bold" style={{ color: config.theme.accentHex }}>{currentIndex + 1} / {pool.length}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentArtist.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) handleNext(true);
              else if (info.offset.x < -100) handleNext(false);
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ 
              x: direction * 500, 
              opacity: 0, 
              rotate: direction * 45,
              transition: { duration: 0.3 } 
            }}
            className="w-full max-w-md aspect-[3/4] relative bg-[#111] border-4 border-white overflow-hidden shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)] flex flex-col cursor-grab active:cursor-grabbing"
          >
            {/* Indicators */}
            <motion.div style={{ scale: heartScale }} className="absolute top-10 right-10 z-20 pointer-events-none">
              <div className="p-4 rounded-full" style={{ background: config.theme.accentHex }}>
                <Heart className="w-12 h-12 text-black fill-black" />
              </div>
            </motion.div>
            <motion.div style={{ scale: xScale }} className="absolute top-10 left-10 z-20 pointer-events-none">
              <div className="bg-red-500 p-4 rounded-full">
                <X className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Image Section */}
            <div className="relative w-full h-full">
              {currentArtist.imageUrl ? (
                <Image
                  src={currentArtist.imageUrl}
                  alt={currentArtist.artist}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <Music className="w-16 h-16 text-zinc-800" />
                </div>
              )}
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <div className="space-y-1">
                  {currentArtist.returningHero && (
                    <Badge className="text-black font-black italic border-none text-[10px] py-0 px-2" style={{ background: config.theme.accentHex }}>
                      RETURNING HERO
                    </Badge>
                  )}
                  <h2 className="text-4xl font-black text-white uppercase italic leading-none tracking-tighter">
                    {currentArtist.artist}
                  </h2>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentArtist.genres?.slice(0, 3).map(g => (
                      <span key={g} className="text-[10px] font-bold text-muted-foreground uppercase">{g}</span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-zinc-300 line-clamp-3 font-medium italic border-l-2 pl-3" style={{ borderColor: config.theme.accentHex }}>
                  {currentArtist.description || `The ${config.name} vibe is calling. Don't miss this one.`}
                </p>

                <div className="flex gap-2 pt-2">
                  {currentArtist.vibes?.slice(0, 2).map(v => (
                    <Badge key={v} variant="outline" className="border-white/20 text-[10px] font-bold text-white uppercase italic">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-8 flex items-center justify-center gap-8 z-10 bg-gradient-to-t from-black to-transparent">
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-transparent border-4 border-white hover:bg-white/10 transition-transform active:scale-90"
          onClick={() => handleNext(false)}
        >
          <X className="w-8 h-8 text-white" />
        </Button>
        <Button
          size="icon"
          className="w-20 h-20 rounded-full border-4 border-black hover:scale-105 transition-transform active:scale-95 shadow-2xl"
          style={{ background: config.theme.accentHex, boxShadow: `0 0 20px ${config.theme.accentHex}44` }}
          onClick={() => handleNext(true)}
        >
          <Heart className="w-10 h-10 text-black fill-black" />
        </Button>
        <Link href={`/${festivalId}/artist/${currentArtist.id}`}>
          <Button
            size="icon"
            className="w-16 h-16 rounded-full bg-transparent border-4 border-white hover:bg-white/10 transition-transform active:scale-90"
          >
            <Info className="w-8 h-8 text-white" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
