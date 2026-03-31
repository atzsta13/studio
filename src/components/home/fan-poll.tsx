'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, CheckCircle2 } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

export function FanPoll() {
  const [voted, setVoted] = useState<number | null>(null);
  
  const options = [
    { label: 'Colosseum Rave', votes: 420 },
    { label: 'Main Stage Headliner', votes: 850 },
    { label: 'Island Eye Secret Set', votes: 120 },
    { label: 'Campground Party', votes: 310 },
  ];

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0) + (voted !== null ? 1 : 0);

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem] p-10 mt-12">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <BarChart2 size={24} />
        </div>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Fan Poll</h3>
      </div>
      
      <p className="text-xl font-bold italic mb-8">Where are you heading at midnight tonight?</p>
      
      <div className="grid grid-cols-1 gap-4">
        {options.map((opt, i) => {
          const percentage = Math.round(((opt.votes + (voted === i ? 1 : 0)) / totalVotes) * 100);
          return (
            <button
              key={i}
              disabled={voted !== null}
              onClick={() => setVoted(i)}
              className="relative w-full h-16 rounded-[1.5rem] bg-white/5 border border-white/5 overflow-hidden group text-left transition-all hover:scale-[1.02] active:scale-95 disabled:hover:scale-100"
            >
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-1000"
                style={{ width: voted !== null ? `${percentage}%` : '0%' }}
              />
              <div className="relative px-8 h-full flex items-center justify-between">
                <span className="font-black uppercase tracking-widest text-[11px]">{opt.label}</span>
                {voted !== null ? (
                   <span className="font-black italic text-primary">{percentage}%</span>
                ) : (
                  <CheckCircle2 size={16} className="text-white/10 group-hover:text-primary transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {voted !== null && (
        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
          {totalVotes} Votes recorded live on the Island.
        </p>
      )}
    </Card>
  );
}
