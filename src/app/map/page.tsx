'use client';

import { useState } from 'react';
import { Map, Pin, Compass, Layers } from 'lucide-react';

export default function MapPage() {
  // Basic state for map settings, to be expanded later
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState([47.552, 19.052]); // Sziget Island coordinates

  return (
    <div className="flex h-full flex-col">
      <header className="container sticky top-0 z-30 bg-background/95 py-4 text-center backdrop-blur-sm md:top-16">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Interactive Map
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find your way around the Island of Freedom.
        </p>
      </header>
      
      <div className="relative flex-1 bg-muted/40">
        {/* Placeholder for the map component */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <Map className="mx-auto h-16 w-16" />
                <p className="mt-4 text-lg font-medium">Map coming soon!</p>
                <p className="text-sm">We're charting the stages, food stalls, and secrets of the island.</p>
            </div>
        </div>

        {/* Basic map controls overlay */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button className="rounded-full bg-background/80 p-3 shadow-lg backdrop-blur-sm"><Layers className="h-5 w-5" /></button>
            <button className="rounded-full bg-background/80 p-3 shadow-lg backdrop-blur-sm"><Compass className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}
