'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  MapPin,
  Music,
  Flame,
  Droplet,
  Utensils,
  Lock,
  CheckCircle2,
  Star,
  Navigation,
  Clock,
  Wand2
} from 'lucide-react';

interface Stamp {
  id: string;
  title: string;
  icon: any;
  description: string;
  category: 'stage' | 'utility' | 'food' | 'secret';
  color: string;
}

const STAMPS: Stamp[] = [
  { id: 's1', title: 'Main Stage Legend', icon: Star, description: 'Visit the Main Stage during a headliner set.', category: 'stage', color: 'text-yellow-500' },
  { id: 's2', title: 'Colosseum Raver', icon: Flame, description: 'Dance at the Colosseum for at least 1 hour.', category: 'stage', color: 'text-orange-500' },
  { id: 's3', title: 'Water Finder', icon: Droplet, description: 'Locate 3 different water refill points on your map.', category: 'utility', color: 'text-blue-500' },
  { id: 's4', title: 'Global Gourmet', icon: Utensils, description: 'Eat at 3 different international stalls.', category: 'food', color: 'text-emerald-500' },
  { id: 's5', title: 'Art Garden Dreamer', icon: MapPin, description: 'Visit the Art Garden at midnight.', category: 'secret', color: 'text-purple-500' },
  { id: 's6', title: 'Bridge Crosser', icon: Navigation, description: 'Cross the K-Bridge at dawn.', category: 'secret', color: 'text-pink-500' },
  { id: 's7', title: 'Early Bird', icon: Clock, description: 'Be the first at a stage before 4 PM.', category: 'utility', color: 'text-cyan-500' },
  { id: 's8', title: 'Scout Master', icon: Wand2, description: 'Follow 3 AI Scout recommendations.', category: 'secret', color: 'text-indigo-500' },
];

const STORAGE_KEY = 'sziget_passport_v1';

const RANKS = [
  { title: 'Tourist', minXP: 0 },
  { title: 'Island Explorer', minXP: 200 },
  { title: 'Szitizen', minXP: 500 },
  { title: 'Main Stage Hero', minXP: 1000 },
  { title: 'Sziget Legend', minXP: 2000 },
];

export default function PassportPage() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [packingCount, setPackingCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Stamps
    const savedStamps = localStorage.getItem(STORAGE_KEY);
    if (savedStamps) setUnlocked(JSON.parse(savedStamps));

    // Load Favorites Count
    try {
      const favs = localStorage.getItem('sziget-2026-favorites');
      if (favs) setFavoritesCount(JSON.parse(favs).length);
    } catch (e) { }

    // Load Packing List Count
    try {
      const packedItems = Object.keys(localStorage).filter(k => k.startsWith('sziget-packed-'));
      setPackingCount(packedItems.length);
    } catch (e) { }

    setIsLoaded(true);
  }, []);

  const totalXP = (unlocked.length * 50) + (favoritesCount * 10) + (packingCount * 2);

  const currentRankIndex = [...RANKS].reverse().findIndex(r => totalXP >= r.minXP);
  const currentRank = RANKS[RANKS.length - 1 - currentRankIndex] || RANKS[0];
  const nextRank = RANKS[RANKS.length - currentRankIndex] || null;

  let xpProgress = 100;
  if (nextRank) {
    const range = nextRank.minXP - currentRank.minXP;
    const currentProgress = totalXP - currentRank.minXP;
    xpProgress = Math.round((currentProgress / range) * 100);
  }

  const toggleStamp = (id: string) => {
    setUnlocked(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    const updated = unlocked.includes(id) ? unlocked.filter(s => s !== id) : [...unlocked, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const progress = Math.round((unlocked.length / STAMPS.length) * 100);

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <PageHeader
        title="Island Passport & XP"
        description="Collect stamps, favorite artists, and unlock your ultimate Sziget Legend rank."
      />

      <div className="mb-12">
        <Card className="bg-gradient-to-br from-indigo-600 to-primary text-white border-none shadow-2xl shadow-indigo-500/20 overflow-hidden relative">
          <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
            <Trophy size={200} />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Stamp Status</p>
                <h3 className="text-5xl font-black italic uppercase tracking-tighter">{progress}%</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest">{unlocked.length} / {STAMPS.length} STAMPS</p>
              </div>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {STAMPS.map((stamp) => {
          const isDone = unlocked.includes(stamp.id);
          const Icon = stamp.icon;

          return (
            <button
              key={stamp.id}
              onClick={() => toggleStamp(stamp.id)}
              className={`group relative aspect-square flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all duration-500 ${isDone
                  ? 'bg-card border-primary shadow-xl shadow-primary/10 rotate-[-2deg]'
                  : 'bg-muted/30 border-border/50 hover:border-border grayscale opacity-60'
                }`}
            >
              <div className={`mb-3 p-4 rounded-full transition-all duration-500 ${isDone ? `bg-white shadow-inner ${stamp.color}` : 'bg-muted text-muted-foreground'}`}>
                {isDone ? <Icon size={32} /> : <Lock size={24} />}
              </div>
              <h4 className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                {stamp.title}
              </h4>

              {isDone && (
                <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-300">
                  <CheckCircle2 size={16} />
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white rounded-[2rem] p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] font-bold text-center leading-relaxed">
                {stamp.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-16 bg-card border border-border/50 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-40px] left-[50%] -translate-x-1/2 opacity-5 blur-[100px] bg-primary w-80 h-80 rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 shadow-inner">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Current Title</p>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">{currentRank.title}</h3>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-5xl font-black uppercase italic tracking-tighter text-primary">{totalXP} <span className="text-2xl text-muted-foreground">XP</span></p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Level Progress</span>
                {nextRank ? <span>Next: {nextRank.title} ({nextRank.minXP} XP)</span> : <span>MAX LEVEL</span>}
              </div>
              <Progress value={xpProgress} className="h-4 bg-muted/30" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mt-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-3xl font-black">{unlocked.length}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Stamps (+50 XP/ea)</p>
              </div>
              <div>
                <p className="text-3xl font-black">{favoritesCount}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Favorites (+10 XP/ea)</p>
              </div>
              <div>
                <p className="text-3xl font-black">{packingCount}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Packed (+2 XP/ea)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
