'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, RotateCcw, GlassWater } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FESTIVAL } from '@/config/festival';

const STORAGE_KEY = `${FESTIVAL.id}-hydration`;

export function HydrationTracker() {
  const { toast } = useToast();
  const [glasses, setGlasses] = useState(0);
  const goal = 10; // 10 glasses of water per day target

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { count, date } = JSON.parse(saved);
      const today = new Date().toLocaleDateString();
      if (date === today) {
        setGlasses(count);
      }
    }
  }, []);

  const addGlass = () => {
    const newCount = glasses + 1;
    setGlasses(newCount);
    const today = new Date().toLocaleDateString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: newCount, date: today }));
    
    if (newCount === goal) {
      toast({
        title: "GOAL REACHED!",
        description: "Hydration levels optimal. You are a festival legend.",
      });
    }
  };

  const reset = () => {
    setGlasses(0);
    const today = new Date().toLocaleDateString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
  };

  const progress = Math.min((glasses / goal) * 100, 100);

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
      <CardHeader className="bg-blue-500/10 border-b border-blue-500/10 px-10 py-8 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-4 text-blue-400 text-2xl font-black uppercase italic tracking-tighter">
          <Droplets size={32} />
          Hydration Tracker
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={reset} className="text-muted-foreground hover:text-white rounded-full">
          <RotateCcw size={20} />
        </Button>
      </CardHeader>
      <CardContent className="p-10">
        <div className="flex flex-col items-center gap-8">
          <div className="relative h-48 w-48 flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                className="text-white/5"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * progress) / 100}
                className="text-blue-500 transition-all duration-1000"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-6xl font-black tracking-tighter italic leading-none">{glasses}</span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Glasses</p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <span>Goal: {goal} Glasses</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5 bg-white/5" />
          </div>

          <Button 
            onClick={addGlass}
            className="w-full h-20 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 gap-4"
          >
            <GlassWater size={24} />
            Drink 250ml
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
