'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, MapPin, Music, Utensils, Zap, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'music' | 'food' | 'map' | 'hidden';
  points: number;
}

const QUESTS: Quest[] = [
  { id: 'q1', title: 'The Headliner Hunter', description: 'See 3 different main stage headliners.', icon: Star, category: 'music', points: 100 },
  { id: 'q2', title: 'Global Groove', description: 'See artists from at least 5 different countries.', icon: Globe, category: 'music', points: 150 },
  { id: 'q3', title: 'The Early Bird', description: 'Catch a set before 4:00 PM.', icon: Clock, category: 'music', points: 50 },
  { id: 'q4', title: 'Island Gourmet', description: 'Try food from 3 different vendors.', icon: Utensils, category: 'food', points: 100 },
  { id: 'q5', title: 'Hydration Pro', description: 'Visit all 4 main water points on the island.', icon: Droplet, category: 'map', points: 120 },
  { id: 'q6', title: 'Colosseum Gladiator', description: 'Dance at the Colosseum after midnight.', icon: Zap, category: 'map', points: 200 },
  { id: 'q7', title: 'The Sziget Scout', description: 'Use the AI Scout to find a new artist.', icon: Wand2, category: 'hidden', points: 80 },
  { id: 'q8', title: 'Safety First', description: 'Locate the First Aid HQ on your map.', icon: HeartPulse, category: 'map', points: 50 },
];

const STORAGE_KEY = 'sziget_quests_v1';

import { Globe, Clock, Droplet, HeartPulse, Wand2 } from 'lucide-react';

export default function QuestsPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setCompleted(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  }, [completed, isLoaded]);

  const toggleQuest = (id: string) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const totalPoints = QUESTS.reduce((acc, q) => acc + (completed.includes(q.id) ? q.points : 0), 0);
  const maxPoints = QUESTS.reduce((acc, q) => acc + q.points, 0);
  const progress = Math.round((completed.length / QUESTS.length) * 100);

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <PageHeader 
        title="Island Quests"
        description="Become a Sziget Legend. Complete challenges, earn points, and explore every corner of the Island of Freedom."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/20 to-indigo-500/20 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Rank: Island Rookie</p>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">{totalPoints} PTS</h3>
              </div>
              <Trophy className="h-12 w-12 text-yellow-500 drop-shadow-lg" />
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {completed.length} / {QUESTS.length} Quests Completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg uppercase font-black italic">Badge Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`aspect-square rounded-xl flex items-center justify-center border-2 border-dashed ${i <= completed.length / 2 ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted/50 border-border/50 text-muted-foreground/30'}`}>
                  {i <= completed.length / 2 ? <Star className="h-6 w-6 fill-current" /> : <Lock className="h-5 w-5" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUESTS.map((quest) => {
          const isDone = completed.includes(quest.id);
          const Icon = quest.icon;
          
          return (
            <button
              key={quest.id}
              onClick={() => toggleQuest(quest.id)}
              className={`group text-left relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${
                isDone 
                  ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10 translate-y-[-2px]' 
                  : 'bg-card border-border/50 hover:border-primary/30'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${isDone ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant={isDone ? 'default' : 'outline'} className={isDone ? 'bg-primary border-none' : 'opacity-50'}>
                  {quest.points} PTS
                </Badge>
              </div>
              
              <h4 className={`text-xl font-black uppercase italic tracking-tighter mb-1 ${isDone ? 'text-primary' : 'text-foreground'}`}>
                {quest.title}
              </h4>
              <p className="text-sm font-medium text-muted-foreground leading-snug">
                {quest.description}
              </p>

              {isDone && (
                <div className="absolute top-[-10px] right-[-10px] bg-green-500 rounded-full p-1 text-white shadow-lg ring-4 ring-background">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
