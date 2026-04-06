import { NextResponse } from 'next/server';
import { getFestivalConfig } from '@/config/festival-engine';

// Per-festival cache keyed by festival ID
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function buildUrl(lat: number, lng: number, timezone: string): string {
    return (
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lng}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&hourly=precipitation_probability` +
        `&timezone=${encodeURIComponent(timezone)}` +
        `&forecast_days=7`
    );
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId') ?? undefined;
    const festivalConfig = getFestivalConfig(festivalId);
    const cacheKey = festivalConfig.id;

    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
    }

    const { lat, lng, timezone } = festivalConfig.location;
    const url = buildUrl(lat, lng, timezone);

    try {
        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const raw = await res.json();

        const daily = raw.daily;
        const hourlyPrecip: number[] = raw.hourly.precipitation_probability;
        const rainAlert = hourlyPrecip.slice(0, 24).some((p) => p > 60);

        const forecast = (daily.time as string[]).map((date: string, i: number) => ({
            date: `${date}T00:00:00Z`,
            maxTemp: daily.temperature_2m_max[i] as number,
            minTemp: daily.temperature_2m_min[i] as number,
            precipProbability: daily.precipitation_probability_max[i] as number,
            weatherCode: daily.weathercode[i] as number,
        }));

        const data = { forecast, rainAlert };
        cache.set(cacheKey, { data, timestamp: now });
        return NextResponse.json(data);
    } catch (err) {
        console.error('Weather fetch error:', err);
        return NextResponse.json({ forecast: [], rainAlert: false });
    }
}
