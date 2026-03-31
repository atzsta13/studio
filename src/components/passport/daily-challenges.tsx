'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, Circle } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';
import { useState, useEffect } from 'react';

const CHALLENGES = [
  { id: 'c1', text: 'Visit 3 different stages today.', xp: 100 },
  { id: 'c2', text: 'Drink 2L of water (8 glasses).', xp: 50 },
  { id: 'c3', text: 'Favorite a hidden gem (under 50k monthly listeners).', xp: 75 },
];

export function DailyChallenges() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`${FESTIVAL.id}-daily-challenges`);
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const toggle = (id: string) => {
    const next = completed.includes(id) ? completed.filter(i => i !== id) : [...completed, id];
    setCompleted(next);
    localStorage.setItem(`${FESTIVAL.id}-daily-challenges`, JSON.stringify(next));
  };

  return (
    <Card className="bg-primary/5 border border-primary/20 shadow-2xl overflow-hidden rounded-[3rem] mt-12">
      <CardHeader className="bg-primary/10 border-b border-primary/10 px-10 py-8">
        <CardTitle className="flex items-center gap-4 text-primary text-2xl font-black uppercase italic tracking-tighter">
          <Zap size={32} />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <div className="space-y-4">
          {CHALLENGES.map(c => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all ${
                completed.includes(c.id) 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-white/5 border-white/5 text-foreground hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4 text-left">
                 {completed.includes(c.id) ? <CheckCircle2 size={20} /> : <Circle size={20} className="opacity-20" />}
                 <p className="font-bold italic text-sm">{c.text}</p>
              </div>
              <Badge variant="outline" className="font-black text-[9px] px-3 py-1 rounded-full border-primary/30 text-primary uppercase">
                +{c.xp} XP
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
