'use client';

import { useState, useMemo } from 'react';
import {
  Music,
  Utensils,
  Droplet,
  Activity,
  Navigation,
  Info,
  X,
  History
} from 'lucide-react';
import lineup2026 from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import food from '@/data/food.json';
import poiData from '@/data/poi.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// Helper to get unique stages with fixed coordinates
const stagePositions: Record<string, { x: number; y: number }> = {
  'Main Stage': { x: 42, y: 48 },
  'Revolut Stage': { x: 28, y: 38 },
  'Colosseum': { x: 35, y: 22 },
  'Bolt Party Arena': { x: 22, y: 55 },
  'A38 Stage': { x: 12, y: 42 },
  'World Music Stage': { x: 62, y: 72 },
  'The Buzz': { x: 55, y: 30 },
  'Yettel Colosseum': { x: 35, y: 22 }, // Alias for 2025
  'Bolt Party Arena 2025': { x: 22, y: 55 }, // Alias for 2025
};

export default function MapPage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');
  const [activeCategory, setActiveCategory] = useState<'all' | 'music' | 'food' | 'util'>('all');
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const currentLineup = useMemo(() => {
    return activeYear === '2026' ? lineup2026 : lineup2025;
  }, [activeYear]);

  // Combine all map pins
  const allPins = useMemo(() => {
    const musicPins = Object.entries(stagePositions).map(([name, coords]) => {
      // Find artist currently on stage (first one in data for now as a preview)
      const stageData = currentLineup.find(a => a.stage === name);
      if (!stageData && activeYear === '2026') return null; // Only show relevant stages for the year
      if (!stageData && activeYear === '2025' && !['Main Stage', 'Revolut Stage', 'Bolt Party Arena', 'Yettel Colosseum', 'The Club by Don Julio', 'Sziget Beach', 'The Buzz', 'dropYard', 'Jukebox', 'Lightstage'].some(s => s === name)) return null;

      return {
        id: `stage-${name}`,
        name,
        type: 'music',
        ...coords,
        icon: Music,
        color: 'bg-primary',
        data: stageData
      };
    }).filter(Boolean);

    const foodPins = food.map(f => ({
      id: f.id,
      name: f.name,
      type: 'food',
      x: f.mapCoords.x,
      y: f.mapCoords.y,
      icon: Utensils,
      color: 'bg-emerald-500',
      data: f
    }));

    const utilPins = poiData.map(p => ({
      id: p.id,
      name: p.name,
      type: 'util',
      x: p.mapCoords.x,
      y: p.mapCoords.y,
      icon: p.type === 'water' ? Droplet : p.type === 'first-aid' ? Activity : Info,
      color: p.type === 'water' ? 'bg-blue-500' : p.type === 'first-aid' ? 'bg-red-500' : 'bg-amber-500',
      data: p
    }));

    return [...musicPins, ...foodPins, ...utilPins];
  }, [currentLineup, activeYear]);

  const filteredPins = allPins.filter(pin =>
    activeCategory === 'all' || pin?.type === activeCategory
  );

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-zinc-950">
      {/* Map Header Overlay */}
      <div className="absolute left-4 right-4 top-4 z-20 flex flex-col gap-4 md:left-8 md:top-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white md:text-3xl">
              Island Utility <span className="text-primary italic">{activeYear}</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Ground Truth & Scouting</p>
          </div>

          {/* Year Switcher */}
          <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 backdrop-blur-xl shadow-inner w-fit">
            <button
              onClick={() => setActiveYear('2026')}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${activeYear === '2026'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              2026
            </button>
            <button
              onClick={() => setActiveYear('2025')}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${activeYear === '2025'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              <History className="h-3 w-3" />
              2025
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-black/40 p-2 backdrop-blur-xl border border-white/10">
          <Button
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'ghost'}
            onClick={() => setActiveCategory('all')}
            className="rounded-xl h-9 px-4"
          >All</Button>
          <Button
            size="sm"
            variant={activeCategory === 'music' ? 'default' : 'ghost'}
            onClick={() => setActiveCategory('music')}
            className="rounded-xl h-9 px-4 gap-2"
          ><Music className="h-4 w-4" /> Music</Button>
          <Button
            size="sm"
            variant={activeCategory === 'food' ? 'default' : 'ghost'}
            onClick={() => setActiveCategory('food')}
            className="rounded-xl h-9 px-4 gap-2 text-emerald-400 hover:text-emerald-300"
          ><Utensils className="h-4 w-4" /> Food</Button>
          <Button
            size="sm"
            variant={activeCategory === 'util' ? 'default' : 'ghost'}
            onClick={() => setActiveCategory('util')}
            className="rounded-xl h-9 px-4 gap-2 text-blue-400 hover:text-blue-300"
          ><Navigation className="h-4 w-4" /> Logistics</Button>
        </div>
      </div>

      {/* The Visual Map Area */}
      <div className="relative flex-1 cursor-grab active:cursor-grabbing">
        {/* Stylized Island SVG Background */}
        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
          <div className="relative aspect-[3/4] h-full max-h-full w-auto overflow-hidden rounded-[4rem] bg-zinc-900 shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e3a8a_0%,transparent_70%)] opacity-30" />

            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M20,10 Q50,0 80,15 T90,50 T70,90 T30,85 T10,50 Z"
                fill="#18181b"
                stroke="#27272a"
                strokeWidth="0.5"
              />
              <circle cx="25" cy="25" r="10" fill="#064e3b" opacity="0.3" />
              <circle cx="75" cy="75" r="15" fill="#064e3b" opacity="0.2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.05" opacity="0.1" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.05" opacity="0.1" />
            </svg>

            {/* Interactive Pins */}
            {filteredPins.map((pin) => pin && (
              <button
                key={pin.id}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 ring-4 ring-black/50 transition-all hover:scale-125 hover:z-20 ${pin.color} ${selectedPin?.id === pin.id ? 'scale-150 ring-white' : ''}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onClick={() => setSelectedPin(pin)}
              >
                <pin.icon className="h-4 w-4 text-white" />
              </button>
            ))}
          </div>
        </div>

        {/* Selected Pin Details */}
        {selectedPin && (
          <div className="absolute bottom-6 left-6 right-6 z-30 animate-in slide-in-from-bottom-10 lg:left-auto lg:right-10 lg:top-32 lg:bottom-auto lg:w-80">
            <Card className="overflow-hidden border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-2xl">
              <div className="relative p-6">
                <button
                  onClick={() => setSelectedPin(null)}
                  className="absolute right-4 top-4 rounded-full bg-white/5 p-1 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className={`mb-4 inline-flex rounded-xl p-3 ${selectedPin.color}`}>
                  <selectedPin.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-black text-white">{selectedPin.name}</h3>
                <p className="mb-4 text-sm font-medium text-zinc-400">{selectedPin.data?.location || selectedPin.data?.stage || 'Island Center'}</p>

                {selectedPin.type === 'music' && (
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 line-clamp-1">
                      Artist: {selectedPin.data?.artist || 'TBA'}
                    </Badge>
                    <Button asChild className="w-full rounded-xl">
                      <Link href={selectedPin.data?.id ? `/artist/${selectedPin.data.id}` : '/schedule'}>Lineup Details</Link>
                    </Button>
                  </div>
                )}

                {selectedPin.type === 'food' && (
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400 line-clamp-2">{selectedPin.data.description}</p>
                    {selectedPin.data.budgetPrice && (
                      <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20">
                        <div className="flex justify-between items-center text-emerald-400 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest">Budget Option</span>
                          <span className="font-black">{selectedPin.data.budgetPrice}</span>
                        </div>
                        <p className="text-xs text-white font-bold">{selectedPin.data.budgetOption}</p>
                      </div>
                    )}
                    <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl">
                      <Link href="/food">Menu Details</Link>
                    </Button>
                  </div>
                )}

                {selectedPin.type === 'util' && (
                  <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
                    <p className="text-sm text-blue-300 font-medium">Official utility point. Available 24/7 during the festival.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-8 z-20 hidden flex-col gap-2 md:flex">
        <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 backdrop-blur-md border border-white/5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Stages
          <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500" /> Stalls
          <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" /> Utility
        </div>
      </div>
    </div>
  );
}
