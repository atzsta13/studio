'use client';

import { useEffect, useState } from 'react';
import { Cloud, Sun, Umbrella, Snowflake, Zap, Droplets } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getFestivalConfig } from '@/config/festival-engine';

interface DailyForecast {
    date: string;
    maxTemp: number;
    minTemp: number;
    precipProbability: number;
    weatherCode: number;
}

interface WeatherData {
    forecast: DailyForecast[];
    rainAlert: boolean;
}

type LucideIcon = typeof Sun;

function weatherIcon(code: number): LucideIcon {
    if (code === 0) return Sun;
    if (code <= 3) return Cloud;
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return Umbrella;
    if (code >= 71 && code <= 77) return Snowflake;
    if (code >= 95) return Zap;
    return Cloud;
}

function weatherColor(code: number): string {
    if (code === 0) return 'text-orange-400';
    if (code <= 3) return 'text-zinc-400';
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return 'text-blue-400';
    if (code >= 71 && code <= 77) return 'text-cyan-300';
    if (code >= 95) return 'text-yellow-300';
    return 'text-zinc-400';
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeatherWidget() {
    const { festivalId } = useParams() as { festivalId: string };
    const config = getFestivalConfig(festivalId);

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/weather')
            .then((r) => r.json())
            .then(setWeather)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-card/50 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-10 animate-pulse">
                <div className="h-6 bg-muted/40 rounded-full w-32 mb-6" />
                <div className="flex gap-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-16 h-24 bg-muted/20 rounded-[1.5rem]" />
                    ))}
                </div>
            </div>
        );
    }

    if (!weather || weather.forecast.length === 0) return null;

    return (
        <div className="bg-card/50 backdrop-blur-3xl border border-cyan-500/10 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-5">
                <Cloud size={160} />
            </div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-4 rounded-[1.5rem] bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Cloud size={28} />
                </div>
                <div>
                    <h4 className="font-black text-2xl uppercase italic tracking-tighter text-cyan-400">Weather</h4>
                    <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">{config.location.weatherDisplayName}</p>
                </div>
            </div>

            {weather.rainAlert && (
                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-[1.5rem] px-5 py-3 mb-6 animate-pulse">
                    <Droplets className="text-blue-400 shrink-0" size={18} />
                    <p className="text-sm font-bold text-blue-400">Rain likely in the next 24h — pack a poncho!</p>
                </div>
            )}

            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {weather.forecast.slice(0, 7).map((day) => {
                    const d = new Date(day.date);
                    const dayLabel = DAYS[d.getDay()];
                    const IconComponent = weatherIcon(day.weatherCode);
                    const colorClass = weatherColor(day.weatherCode);
                    return (
                        <div
                            key={day.date}
                            className="flex flex-col items-center gap-1.5 p-4 rounded-[1.5rem] bg-background border border-white/5 shadow-inner min-w-[64px]"
                        >
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{dayLabel}</span>
                            <IconComponent className={`h-7 w-7 ${colorClass}`} />
                            <span className="text-base font-black">{Math.round(day.maxTemp)}°</span>
                            <span className="text-xs text-muted-foreground">{Math.round(day.minTemp)}°</span>
                            {day.precipProbability > 0 && (
                                <span className="text-[10px] font-black text-blue-400">{day.precipProbability}%</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
