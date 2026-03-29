'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Trash2, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FESTIVAL } from '@/config/festival';

const STORAGE_KEY = `${FESTIVAL.id}-tent-location`;

export function TentFinder() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
    const [bearing, setBearing] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setLocation(JSON.parse(saved));
    }, []);

    const saveSpot = () => {
        if (!navigator.geolocation) {
            toast({ title: "ERROR", description: "Geolocation not supported", variant: "destructive" });
            return;
        }

        navigator.geolocation.getCurrentPosition((pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(coords);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
            toast({ title: "SPOT MARKED", description: "Campsite coordinates locked." });
        }, () => {
            toast({ title: "ERROR", description: "Could not acquire signal", variant: "destructive" });
        });
    };

    const clearSpot = () => {
        setLocation(null);
        localStorage.removeItem(STORAGE_KEY);
        toast({ title: "CLEARED", description: "Campsite data wiped." });
    };

    return (
        <Card className="bg-card/50 border-white/5 rounded-[3rem] overflow-hidden">
            <CardContent className="p-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500">
                            <MapPin size={28} />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Tent Finder</h3>
                    </div>
                    {location && (
                        <Button variant="ghost" onClick={clearSpot} className="h-12 w-12 rounded-full text-red-500 hover:bg-red-500/10">
                            <Trash2 size={20} />
                        </Button>
                    )}
                </div>

                {!location ? (
                    <Button 
                        onClick={saveSpot}
                        className="w-full h-20 rounded-[1.5rem] bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-[0.3em] text-lg shadow-2xl shadow-yellow-500/20"
                    >
                        Mark My Tent
                    </Button>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col items-center justify-center py-10 bg-zinc-900/50 rounded-[2.5rem] border border-white/5">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
                                <div className="relative bg-yellow-500 p-8 rounded-full shadow-2xl">
                                    <Navigation className="text-black h-12 w-12" />
                                </div>
                            </div>
                            <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest italic">Signal Locked</p>
                        </div>
                        <Button 
                            variant="outline"
                            className="w-full h-16 rounded-[1.5rem] border-white/10 hover:bg-white/5 font-black uppercase tracking-[0.2em] text-[11px]"
                        >
                            Refresh Heading
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
