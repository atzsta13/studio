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
  Star
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
  { id: 's3', title: 'Hydration Hero', icon: Droplet, description: 'Log 5 water refills at the map stations.', category: 'utility', color: 'text-blue-500' },
  { id: 's4', title: 'Global Gourmet', icon: Utensils, description: 'Eat at 3 different international stalls.', category: 'food', color: 'text-emerald-500' },
  { id: 's5', title: 'Art Garden Dreamer', icon: MapPin, description: 'Visit the Art Garden at midnight.', category: 'secret', color: 'text-purple-500' },
  { id: 's6', title: 'Bridge Crosser', icon: Navigation, description: 'Cross the K-Bridge at dawn.', category: 'secret', color: 'text-pink-500' },
  { id: 's7', title: 'Early Bird', icon: Clock, description: 'Be the first at a stage before 4 PM.', category: 'utility', color: 'text-cyan-500' },
  { id: 's8', title: 'Scout Master', icon: Wand2, description: 'Follow 3 AI Scout recommendations.', category: 'secret', color: 'text-indigo-500' },
];

import { Navigation, Clock, Wand2 } from 'lucide-react';

const STORAGE_KEY = 'sziget_passport_v1';

export default function PassportPage() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUnlocked(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  const toggleStamp = (id: string) => {
    setUnlocked(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    // Persist
    const updated = unlocked.includes(id) ? unlocked.filter(s => s !== id) : [...unlocked, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const progress = Math.round((unlocked.length / STAMPS.length) * 100);

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <PageHeader 
        title="Island Passport"
        description="Collect digital stamps as you explore the Island of Freedom. Can you unlock the legendary Sziget Citizen badge?"
      />

      <div className="mb-12">
        <Card className="bg-gradient-to-br from-indigo-600 to-primary text-white border-none shadow-2xl shadow-indigo-500/20 overflow-hidden relative">
          <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
            <Trophy size={200} />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Completion Status</p>
                <h3 className="text-5xl font-black italic uppercase tracking-tighter">{progress}%</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest">{unlocked.length} / {STAMPS.length} STAMPS</p>
              </div>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
            <p className="mt-6 text-sm font-medium opacity-90 leading-relaxed max-w-md">
              Each stamp earned increases your "Szitizen" rank. Unlock all 8 to receive a secret AI scouting report.
            </p>
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
              className={`group relative aspect-square flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all duration-500 ${
                isDone 
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

              {/* Hover Tooltip (Simulated) */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white rounded-[2rem] p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] font-bold text-center leading-relaxed">
                {stamp.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-[3rem] bg-card border border-dashed border-border/50">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest">Next Rank Unlocks at 5 Stamps</Badge>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Island Explorer</h3>
          <p className="text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">Keep exploring! The most valuable stamps are hidden in the furthest corners of the island.</p>
        </div>
      </div>
    </div>
  );
}
