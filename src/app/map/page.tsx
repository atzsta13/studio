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
  Users
} from 'lucide-react';
import lineupCurrent from '@/data/lineup.json';
import food from '@/data/food.json';
import poiData from '@/data/poi.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { TentFinder } from '@/components/tools/tent-finder';
import { FESTIVAL } from '@/config/festival';

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'music' | 'food' | 'util'>('all');
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);
  const [hydrationMode, setHydrationMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allPins = useMemo(() => {
    // Derive Stage Pins from poiData (where type === 'stage')
    const musicPins = (poiData as any[]).filter(p => p.type === 'stage').map(p => {
      const stageData = (lineupCurrent as any[]).find(a => a.stage === p.name);
      return {
        id: p.id,
        name: p.name,
        type: 'music',
        x: p.mapCoords.x,
        y: p.mapCoords.y,
        icon: Music,
        color: 'bg-primary',
        data: stageData
      };
    });

    const foodPins = (food as any[]).map(f => ({
      id: f.id,
      name: f.name,
      type: 'food',
      x: f.mapCoords.x,
      y: f.mapCoords.y,
      icon: Utensils,
      color: 'bg-emerald-500',
      data: f
    }));

    const utilPins = (poiData as any[]).filter(p => p.type !== 'stage').map(p => ({
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
  }, [mounted]);

  const filteredPins = allPins.filter(pin => {
    if (hydrationMode) return (pin as any)?.subType === 'water';
    return activeCategory === 'all' || pin?.type === activeCategory;
  });

  if (!mounted) return null;

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-zinc-950">
      {/* Map Header Overlay */}
      <div className={`absolute left-4 right-4 top-4 z-20 flex flex-col gap-4 md:left-8 md:top-8 md:flex-row md:items-start md:justify-between transition-all duration-300 ${showTools || hydrationMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white md:text-3xl">
              {FESTIVAL.name} Radar <span className="text-primary italic">{FESTIVAL.dates.year}</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tactical Navigation</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-black/40 p-2 backdrop-blur-xl border border-white/10">
          <Button size="sm" variant={activeCategory === 'all' ? 'default' : 'ghost'} onClick={() => setActiveCategory('all')} className="rounded-xl h-9 px-4">All</Button>
          <Button size="sm" variant={activeCategory === 'music' ? 'default' : 'ghost'} onClick={() => setActiveCategory('music')} className="rounded-xl h-9 px-4 gap-2 text-primary"><Music className="h-4 w-4" /> Stages</Button>
          <Button size="sm" variant={activeCategory === 'food' ? 'default' : 'ghost'} onClick={() => setActiveCategory('food')} className="rounded-xl h-9 px-4 gap-2 text-emerald-400"><Utensils className="h-4 w-4" /> Food</Button>
        </div>
      </div>

      {/* Floating Survival FAB */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3">
        <Button size="icon" className={`h-12 w-12 rounded-full shadow-2xl transition-all duration-300 border-2 ${hydrationMode ? 'bg-blue-500 border-blue-300' : 'bg-black/60 border-white/20'}`} onClick={() => setHydrationMode(!hydrationMode)}><Droplet className={`h-6 w-6 ${hydrationMode ? 'text-white' : 'text-blue-400'} `} /></Button>
        <Button size="icon" className={`h-12 w-12 rounded-full shadow-2xl transition-all duration-300 border-2 ${showTools ? 'bg-emerald-600 border-emerald-400' : 'bg-black/60 border-white/20'}`} onClick={() => { setShowTools(!showTools); setSelectedPin(null); }}><Zap className={`h-6 w-6 ${showTools ? 'text-white' : 'text-yellow-400'} `} /></Button>
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
            
            {/* Dynamic Map Asset */}
            <img 
              src="/map.svg" 
              alt="Festival Map" 
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hydrationMode ? 'opacity-20' : 'opacity-100'}`}
            />

            {/* Coordinate Layer */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" />

            {filteredPins.map((pin) => {
              if (!pin || !pin.icon) return null;
              const Icon = pin.icon;
              return (
                <button
                  key={pin.id}
                  className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all 
                      ${hydrationMode && (pin as any).subType === 'water' ? 'p-4 ring-4 ring-blue-400 animate-pulse bg-blue-500' : 'p-2 ring-4 ring-black/50 hover:scale-125'} 
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
