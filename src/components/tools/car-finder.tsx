'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Trash2, Navigation } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = `${FESTIVAL.id}-car-location`;

export function CarFinder() {
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLocation(JSON.parse(saved));
  }, []);

  const saveLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "ERROR", description: "Geolocation not supported.", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(loc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      toast({ title: "LOCATION SAVED", description: "Car coordinates secured." });
    }, (err) => {
      toast({ title: "ERROR", description: err.message, variant: "destructive" });
    });
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
      <CardHeader className="bg-amber-500/10 border-b border-amber-500/10 px-10 py-8">
        <CardTitle className="flex items-center gap-4 text-amber-500 text-2xl font-black uppercase italic tracking-tighter">
          <Car size={32} />
          Car Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        {location ? (
          <div className="space-y-8">
            <div className="p-8 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/60 mb-2">Location Locked</p>
               <p className="text-xl font-bold italic opacity-80">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
            </div>
            <div className="flex gap-4">
               <Button asChild className="flex-1 h-16 rounded-[1.2rem] bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-widest gap-3">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer">
                     Navigate <Navigation size={18} />
                  </a>
               </Button>
               <Button variant="ghost" onClick={clearLocation} className="h-16 w-16 rounded-[1.2rem] text-muted-foreground hover:text-red-500 border border-white/5">
                  <Trash2 size={24} />
               </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <p className="text-lg font-medium text-muted-foreground italic opacity-80 leading-relaxed">
               Parked outside the island? Drop a pin to ensure you find your way back.
            </p>
            <Button onClick={saveLocation} className="w-full h-20 rounded-[1.5rem] bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-[0.3em] gap-4 shadow-2xl transition-all hover:scale-[1.02]">
               <MapPin size={24} /> Save Current Spot
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
