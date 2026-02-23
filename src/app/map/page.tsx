'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Music,
  Utensils,
  Droplet,
  Activity,
  Navigation,
  Info,
  X,
  History,
  Zap,
  Flame,
  Users,
  Share2
} from 'lucide-react';
import lineup2026 from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import food from '@/data/food.json';
import poiData from '@/data/poi.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import TentFinder from '@/components/tools/tent-finder';
import { toast } from '@/hooks/use-toast';

const stagePositions: Record<string, { x: number; y: number }> = {
  'Main Stage': { x: 42, y: 48 },
  'Revolut Stage': { x: 28, y: 38 },
  'Colosseum': { x: 35, y: 22 },
  'Bolt Party Arena': { x: 22, y: 55 },
  'A38 Stage': { x: 12, y: 42 },
  'World Music Stage': { x: 62, y: 72 },
  'The Buzz': { x: 55, y: 30 },
  'Yettel Colosseum': { x: 35, y: 22 },
  'The Club': { x: 80, y: 15 },
};

export default function MapPage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');
  const [activeCategory, setActiveCategory] = useState<'all' | 'music' | 'food' | 'util' | 'vibe' | 'density'>('all');
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);
  const [hydrationMode, setHydrationMode] = useState(false);
  const [vibeMode, setVibeMode] = useState(false);
  const [densityMode, setDensityMode] = useState(false);

  const currentLineup = useMemo(() => {
    return activeYear === '2026' ? lineup2026 : lineup2025;
  }, [activeYear]);

  const allPins = useMemo(() => {
    const musicPins = Object.entries(stagePositions).map(([name, coords]) => {
      const stageData = currentLineup.find(a => a.stage === name);
      const isColosseum = name.includes('Colosseum');
      const isMain = name === 'Main Stage';

      return {
        id: `stage-${name}`,
        name,
        type: 'music',
        ...coords,
        icon: Music,
        color: 'bg-primary',
        data: stageData,
        vibeIntensity: isColosseum ? 0.9 : isMain ? 0.7 : 0.4,
        density: isMain ? 0.85 : isColosseum ? 0.95 : 0.3
      };
    });

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
      subType: p.type,
      x: p.mapCoords.x,
      y: p.mapCoords.y,
      icon: p.type === 'water' ? Droplet : p.type === 'first-aid' ? Activity : Info,
      color: p.type === 'water' ? 'bg-blue-500' : p.type === 'first-aid' ? 'bg-red-500' : 'bg-amber-500',
      data: p
    }));

    return [...musicPins, ...foodPins, ...utilPins];
  }, [currentLineup, activeYear]);

  const filteredPins = allPins.filter(pin => {
    if (hydrationMode) return pin?.subType === 'water';
    if (vibeMode) return pin?.type === 'music';
    if (densityMode) return pin?.type === 'music';
    return activeCategory === 'all' || pin?.type === activeCategory;
  });

  const handleShareSpot = () => {
    const code = Math.random().toString(36).substring(7).toUpperCase();
    toast({
      title: "SPOT CODE GENERATED",
      description: `Share this code with friends: SZ-${code}`,
    });
  };

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-zinc-950">
      {/* Map Header Overlay */}
      <div className={`absolute left-4 right-4 top-4 z-20 flex flex-col gap-4 md:left-8 md:top-8 md:flex-row md:items-start md:justify-between transition-all duration-300 ${showTools || hydrationMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white md:text-3xl">
              Island Radar <span className="text-primary italic">{activeYear}</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tactical Navigation</p>
          </div>

          <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 backdrop-blur-xl shadow-inner w-fit">
            <button onClick={() => setActiveYear('2026')} className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${activeYear === '2026' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-zinc-400 hover:text-white'}`}>2026</button>
            <button onClick={() => setActiveYear('2025')} className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${activeYear === '2025' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-zinc-400 hover:text-white'}`}><History className="h-3 w-3" /> 2025</button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-black/40 p-2 backdrop-blur-xl border border-white/10">
          <Button size="sm" variant={!vibeMode && !densityMode && activeCategory === 'all' ? 'default' : 'ghost'} onClick={() => { setActiveCategory('all'); setVibeMode(false); setDensityMode(false); }} className="rounded-xl h-9 px-4">All</Button>
          <Button size="sm" variant={vibeMode ? 'default' : 'ghost'} onClick={() => { setVibeMode(true); setDensityMode(false); }} className={`rounded-xl h-9 px-4 gap-2 ${vibeMode ? 'bg-orange-600' : 'text-orange-400'}`}><Flame className="h-4 w-4" /> Vibe</Button>
          <Button size="sm" variant={densityMode ? 'default' : 'ghost'} onClick={() => { setDensityMode(true); setVibeMode(false); }} className={`rounded-xl h-9 px-4 gap-2 ${densityMode ? 'bg-indigo-600' : 'text-indigo-400'}`}><Users className="h-4 w-4" /> Density</Button>
          <Button size="sm" variant={activeCategory === 'food' ? 'default' : 'ghost'} onClick={() => { setActiveCategory('food'); setVibeMode(false); setDensityMode(false); }} className="rounded-xl h-9 px-4 gap-2 text-emerald-400"><Utensils className="h-4 w-4" /> Food</Button>
        </div>
      </div>

      {/* Floating Survival FAB */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3">
        <Button size="icon" className={`h-12 w-12 rounded-full shadow-2xl transition-all duration-300 border-2 ${hydrationMode ? 'bg-blue-500 border-blue-300' : 'bg-black/60 border-white/20'}`} onClick={() => setHydrationMode(!hydrationMode)}><Droplet className={`h-6 w-6 ${hydrationMode ? 'text-white' : 'text-blue-400'} `} /></Button>
        <Button size="icon" className={`h-12 w-12 rounded-full shadow-2xl transition-all duration-300 border-2 ${showTools ? 'bg-emerald-600 border-emerald-400' : 'bg-black/60 border-white/20'}`} onClick={() => { setShowTools(!showTools); setSelectedPin(null); }}><Zap className={`h-6 w-6 ${showTools ? 'text-white' : 'text-yellow-400'} `} /></Button>
        <Button size="icon" className="h-12 w-12 rounded-full shadow-2xl border-2 bg-black/60 border-white/20" onClick={handleShareSpot}><Share2 className="h-6 w-6 text-white" /></Button>
      </div>

      {/* Tools Overlay */}
      {showTools && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between items-center text-white mb-2">
              <h2 className="text-2xl font-black uppercase italic">Survival Tools</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTools(false)}><X className="h-6 w-6" /></Button>
            </div>
            <TentFinder />
          </div>
        </div>
      )}

      {/* The Visual Map Area */}
      <div className="relative flex-1">
        <div className={`absolute inset-0 flex items-center justify-center p-8 md:p-16 transition-all duration-500 ${hydrationMode ? 'scale-110' : ''}`}>
          <div className={`relative aspect-[3/4] h-full max-h-full w-auto overflow-hidden rounded-[4rem] shadow-2xl border transition-all duration-500 ${hydrationMode ? 'bg-blue-950 border-blue-500/50 grayscale' : 'bg-zinc-900 border-white/5'}`}>
            
            {/* Density Radar Layers */}
            {densityMode && (
              <div className="absolute inset-0 pointer-events-none">
                {allPins.filter(p => p.type === 'music').map(p => (
                  <div key={`density-${p.id}`} className="absolute rounded-full blur-[20px] opacity-30 bg-indigo-500 animate-pulse"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${(p.density || 0.5) * 150}px`, height: `${(p.density || 0.5) * 150}px`, transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </div>
            )}

            {/* Vibe Heatmap Layers */}
            {vibeMode && (
              <div className="absolute inset-0 pointer-events-none">
                {allPins.filter(p => p.type === 'music').map(p => (
                  <div key={`vibe-${p.id}`} className="absolute rounded-full blur-[40px] opacity-40 bg-orange-500 animate-bounce"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${(p.vibeIntensity || 0.5) * 200}px`, height: `${(p.vibeIntensity || 0.5) * 200}px`, transform: 'translate(-50%, -50%)', animationDuration: '3s' }}
                  />
                ))}
              </div>
            )}

            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M20,10 Q50,0 80,15 T90,50 T70,90 T30,85 T10,50 Z" fill={hydrationMode ? "#0f172a" : "#18181b"} stroke={hydrationMode ? "#1e40af" : "#27272a"} strokeWidth="0.5" />
            </svg>

            {filteredPins.map((pin) => {
              if (!pin || !pin.icon) return null;
              const Icon = pin.icon;
              return (
                <button
                  key={pin.id}
                  className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all 
                      ${hydrationMode && pin.subType === 'water' ? 'p-4 ring-4 ring-blue-400 animate-pulse bg-blue-500' : 'p-2 ring-4 ring-black/50 hover:scale-125'} 
                      ${!hydrationMode && pin.color} ${selectedPin?.id === pin.id ? 'scale-150 ring-white' : ''}`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onClick={() => setSelectedPin(pin)}
                >
                  <Icon className={`${hydrationMode ? 'h-8 w-8 text-white' : 'h-4 w-4 text-white'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Pin Details */}
        {selectedPin && !showTools && (
          <div className="absolute bottom-6 left-6 right-6 z-30 lg:left-auto lg:right-10 lg:top-32 lg:w-80">
            <Card className="overflow-hidden border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-2xl p-6">
              <button onClick={() => setSelectedPin(null)} className="absolute right-4 top-4 text-white/50"><X size={16} /></button>
              <div className={`mb-4 inline-flex rounded-xl p-3 ${selectedPin.color}`}><selectedPin.icon className="h-6 w-6 text-white" /></div>
              <h3 className="text-xl font-black text-white">{selectedPin.name}</h3>
              {selectedPin.type === 'music' && (
                <div className="space-y-3 mt-4">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">Live Now: {selectedPin.data?.artist || 'TBA'}</Badge>
                  {densityMode && <p className="text-[10px] font-black uppercase text-indigo-400">Crowd Estimate: 85% Capacity</p>}
                  <Button asChild className="w-full rounded-xl"><Link href={selectedPin.data?.id ? `/artist/${selectedPin.data.id}` : '/timetable'}>Set Details</Link></Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
