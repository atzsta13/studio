'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useParams } from 'next/navigation';

const CAMP_ITEMS = [
  { id: 'tent', label: 'Double-layer Tent', weight: 20 },
  { id: 'bag', label: 'Sleeping Bag (Comfort 10°C)', weight: 15 },
  { id: 'mat', label: 'Sleeping Mat / Air Mattress', weight: 15 },
  { id: 'power', label: 'Large Power Bank (20k+ mAh)', weight: 10 },
  { id: 'lamp', label: 'Headlamp or Lantern', weight: 5 },
  { id: 'lock', label: 'Padlock for Tent', weight: 5 },
  { id: 'wipe', label: 'Body Wipes & Dry Shampoo', weight: 10 },
  { id: 'kit', label: 'Basic First Aid Kit', weight: 10 },
  { id: 'ear', label: 'High-quality Earplugs', weight: 10 },
];

export function CampsiteChecklist() {
  const { festivalId } = useParams() as { festivalId: string };
  const STORAGE_KEY = `${festivalId}-camp-checklist`;
  const [checked, setChecked] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setChecked(JSON.parse(saved));
    setIsLoaded(true);
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    }
  }, [checked, isLoaded, STORAGE_KEY]);

  const toggle = (id: string) => {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const progress = CAMP_ITEMS.reduce((acc, item) => 
    acc + (checked.includes(item.id) ? item.weight : 0), 0
  );

  return (
    <Card className="bg-card/50 border-white/5 overflow-hidden rounded-[2.5rem]">
      <CardContent className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Readiness Score</span>
            <span className="text-xl font-black italic text-emerald-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-muted/30" />
        </div>

        <div className="grid gap-3">
          {CAMP_ITEMS.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${checked.includes(item.id) ? 'bg-emerald-500/5' : 'bg-muted/20 hover:bg-muted/30'}`}
              onClick={() => toggle(item.id)}
            >
              <Checkbox checked={checked.includes(item.id)} />
              <span className={`text-sm font-bold uppercase tracking-tight ${checked.includes(item.id) ? 'text-emerald-400 italic' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
