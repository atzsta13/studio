import { NextResponse } from 'next/server';

let cachedData: unknown = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 60 * 1000;

const OPEN_METEO_URL =
    'https://api.open-meteo.com/v1/forecast?' +
    'latitude=47.5194&longitude=19.0512' +
    '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&hourly=precipitation_probability' +
    '&timezone=Europe%2FBudapest' +
    '&forecast_days=7';

export async function GET() {
    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
        return NextResponse.json(cachedData);
    }

    try {
        const res = await fetch(OPEN_METEO_URL, { next: { revalidate: 1800 } });
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const raw = await res.json();

        const daily = raw.daily;
        const hourlyPrecip: number[] = raw.hourly.precipitation_probability;

        const rainAlert = hourlyPrecip.slice(0, 24).some((p) => p > 60);

        const forecast = (daily.time as string[]).map((date: string, i: number) => ({
            date,
            maxTemp: daily.temperature_2m_max[i] as number,
            minTemp: daily.temperature_2m_min[i] as number,
            precipProbability: daily.precipitation_probability_max[i] as number,
            weatherCode: daily.weathercode[i] as number,
        }));

        const data = { forecast, rainAlert };
        cachedData = data;
        cacheTimestamp = now;
        return NextResponse.json(data);
    } catch (err) {
        console.error('Weather fetch error:', err);
        return NextResponse.json({ forecast: [], rainAlert: false });
    }
}
