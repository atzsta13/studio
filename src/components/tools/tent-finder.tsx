'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tent, Compass, MapPin, Navigation, Trash2 } from 'lucide-react';

interface Coords {
    latitude: number;
    longitude: number;
    timestamp: number;
}

export default function TentFinder() {
    const [tentLocation, setTentLocation] = useState<Coords | null>(null);
    const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [bearing, setBearing] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load saved tent location on mount
    useEffect(() => {
        const saved = localStorage.getItem('sziget-tent-location');
        if (saved) {
            setTentLocation(JSON.parse(saved));
        }
    }, []);

    // Watch current position only if looking for tent
    useEffect(() => {
        if (!tentLocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentLocation(position.coords);
                calculateNavigation(position.coords, tentLocation);
            },
            (err) => setError('GPS Signal weak. Step outside?'),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [tentLocation]);

    const saveTentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: Date.now(),
                };
                setTentLocation(coords);
                localStorage.setItem('sziget-tent-location', JSON.stringify(coords));
                setError(null);
            },
            () => setError('Could not get your location.')
        );
    };

    const clearTentLocation = () => {
        setTentLocation(null);
        localStorage.removeItem('sziget-tent-location');
        setDistance(null);
        setBearing(null);
    };

    // Haversine formula for distance
    const calculateNavigation = (current: GeolocationCoordinates, target: Coords) => {
        const R = 6371e3; // metres
        const φ1 = (current.latitude * Math.PI) / 180;
        const φ2 = (target.latitude * Math.PI) / 180;
        const Δφ = ((target.latitude - current.latitude) * Math.PI) / 180;
        const Δλ = ((target.longitude - current.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        setDistance(Math.round(R * c));

        // Bearing calculation
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);
        const brng = ((θ * 180) / Math.PI + 360) % 360; // in degrees
        setBearing(brng);
    };

    if (!tentLocation) {
        return (
            <Card className="p-6 bg-zinc-900 border-white/10">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                        <Tent size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Lost your tent?</h3>
                        <p className="text-sm text-zinc-400">Save your camping spot now, find it easily later. Works completely offline via GPS.</p>
                    </div>
                    <Button
                        onClick={saveTentLocation}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        <MapPin className="mr-2 h-4 w-4" /> Mark My Spot
                    </Button>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-zinc-900 border-white/10 relative overflow-hidden">
            <div className="flex flex-col items-center gap-6 relative z-10">
                <div className="flex w-full justify-between items-start">
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Tent size={18} className="text-emerald-500" /> My Tent
                        </h3>
                        <p className="text-xs text-zinc-500">Saved {new Date(tentLocation.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearTentLocation} className="text-zinc-600 hover:text-red-500">
                        <Trash2 size={16} />
                    </Button>
                </div>

                <div className="flex flex-col items-center justify-center p-8 relative">
                    {/* Compass Circle */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />

                    {bearing !== null ? (
                        <div
                            className="transform transition-transform duration-500 ease-out"
                            style={{ transform: `rotate(${bearing}deg)` }}
                        >
                            <Navigation size={64} className="text-emerald-500 fill-emerald-500/20" />
                        </div>
                    ) : (
                        <Compass size={64} className="text-zinc-700 animate-pulse" />
                    )}
                </div>

                <div className="text-center">
                    <div className="text-4xl font-black text-white tabular-nums">
                        {distance !== null ? `${distance}m` : 'Finding GPS...'}
                    </div>
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">Distance</p>
                </div>

                {error && <p className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded">{error}</p>}
            </div>
        </Card>
    );
}
