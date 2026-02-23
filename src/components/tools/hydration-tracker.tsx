'use client';

import { useHydration } from '@/hooks/use-hydration';
import { Button } from '@/components/ui/button';
import { Droplet, RotateCcw, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function HydrationTracker() {
  const { waterCount, addWater, resetWater, isLoaded } = useHydration();

  if (!isLoaded) return null;

  return (
    <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20 overflow-hidden relative group">
      <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700">
        <Droplet size={120} />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Hydration Hero</p>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">{waterCount} REFILLS</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetWater}
            className="text-white/40 hover:text-white hover:bg-white/10"
          >
            <RotateCcw size={14} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={addWater}
            className="flex-1 h-12 bg-white text-blue-600 font-black uppercase tracking-widest hover:bg-white/90 gap-2 rounded-xl"
          >
            <Plus size={18} />
            Log Water
          </Button>
        </div>
        <p className="mt-4 text-[9px] font-bold opacity-70 uppercase tracking-widest">Goal: 8 refills per day</p>
      </CardContent>
    </Card>
  );
}
