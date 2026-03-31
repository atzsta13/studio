'use client';

import { useState, useEffect, useMemo } from 'react';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import { Share2, Star, Music, Sparkles, Eye, Radar as RadarIcon } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { FESTIVAL } from '@/config/festival';

const allArtists = lineup as unknown as (LineupItem & { vibes?: string[] })[];

export default function HighlightsPage() {
    const { favorites } = useFavorites(allArtists);
    const [isMounted, setIsMounted] = useState(false);
    const [actsSeenCount, setActsSeenCount] = useState(0);
    useEffect(() => {
        setIsMounted(true);
        try {
            const raw = localStorage.getItem(`${FESTIVAL.id}-seen`);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setActsSeenCount(parsed.length);
            }
        } catch {
            // ignore
        }
    }, []);

    const favArtists = useMemo(
        () => allArtists.filter((a) => favorites.has(a.id)),
        [favorites]
    );

    const topGenres = useMemo(() => {
        const count = new Map<string, number>();
        favArtists.forEach((a) =>
            a.genres?.filter((g) => g !== 'MUSIC').forEach((g) => count.set(g, (count.get(g) ?? 0) + 1))
        );
        return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);
    }, [favArtists]);

    const uniqueGenreCount = useMemo(() => {
        const genres = new Set(
            favArtists.flatMap((a) => (a.genres ?? []).filter((g) => g !== 'MUSIC'))
        );
        return genres.size;
    }, [favArtists]);

    const genreDiversityScore = Math.min(100, uniqueGenreCount * 10);

    const topVibes = useMemo(() => {
        const count = new Map<string, number>();
        favArtists.forEach((a) => a.vibes?.forEach((v) => count.set(v, (count.get(v) ?? 0) + 1)));
        return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v]) => v);
    }, [favArtists]);

    const vibeRadarData = useMemo(() => {
        const count = new Map<string, number>();
        favArtists.forEach((a) => a.vibes?.forEach((v) => count.set(v, (count.get(v) ?? 0) + 1)));
        return [...count.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([subject, value]) => ({ subject, A: value, fullMark: 10 }));
    }, [favArtists]);

    const share = () => {
        const text = [
            `🎪 My ${FESTIVAL.appName} Highlights`,
            '',
            `❤️ Saved artists: ${favArtists.length}`,
            topGenres.length ? `🎵 Top genres: ${topGenres.join(', ')}` : '',
            topVibes.length ? `✨ Vibes: ${topVibes.join(', ')}` : '',
            '',
            ...favArtists.slice(0, 5).map((a) => `• ${a.artist}`),
            '',
            `#${FESTIVAL.name}Festival #${FESTIVAL.name}${FESTIVAL.dates.year}`,
        ].filter(Boolean).join('\n');

        if (navigator.share) {
            navigator.share({ text }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-16 pb-32">
            <div className="mb-12 bg-gradient-to-b from-primary/15 to-transparent rounded-[4rem] p-12 border border-primary/10">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-2">My {FESTIVAL.name}</p>
                <h1 className="font-headline text-8xl font-black tracking-tighter italic uppercase leading-none text-primary mb-1">{FESTIVAL.dates.year}</h1>
                <h2 className="font-headline text-5xl font-black tracking-tighter italic uppercase leading-none mb-8">Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard icon={Music} label="Artists Saved" value={`${favArtists.length}`} color="text-primary" bg="bg-primary/10" />
                    <StatCard icon={Sparkles} label="Top Genres" value={`${topGenres.length}`} color="text-cyan-400" bg="bg-cyan-500/10" />
                    <StatCard icon={Eye} label="Acts Seen" value={`${actsSeenCount}`} color="text-yellow-400" bg="bg-yellow-500/10" />
                </div>
            </div>

            {favArtists.length > 0 && (
                <GenreDnaCard
                    score={genreDiversityScore}
                    uniqueGenreCount={uniqueGenreCount}
                    artistCount={favArtists.length}
                    topGenres={topGenres.slice(0, 3)}
                />
            )}

            {topGenres.length > 0 && (
                <Section title="Top Genres">
                    <div className="flex flex-wrap gap-3">
                        {topGenres.map((g) => (
                            <span key={g} className="px-5 py-2.5 rounded-full border border-primary/30 text-primary font-black uppercase text-[10px] tracking-widest bg-primary/5">
                                {g}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {topVibes.length > 0 && (
                <Section title="Your Vibes">
                    {FESTIVAL.features.vibeAnalysis && vibeRadarData.length >= 3 && (
                        <div className="h-[300px] w-full bg-card/30 rounded-[3rem] border border-white/5 mb-10 p-6 shadow-inner relative overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={vibeRadarData} cx="50%" cy="50%" outerRadius="80%">
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis 
                                        dataKey="subject" 
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} 
                                    />
                                    <Radar
                                        name="Vibe"
                                        dataKey="A"
                                        stroke={FESTIVAL.theme.primaryHex}
                                        fill={FESTIVAL.theme.primaryHex}
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                        {topVibes.map((v) => (
                            <span key={v} className="px-5 py-2.5 rounded-full border border-yellow-500/30 text-yellow-400 font-black uppercase text-[10px] tracking-widest bg-yellow-500/5">
                                {v}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {favArtists.length > 0 && (
                <Section title="Your Lineup">
                    <div className="space-y-2">
                        {favArtists.map((a) => (
                            <p key={a.id} className="font-black text-2xl italic uppercase tracking-tighter leading-none">
                                {a.artist}
                            </p>
                        ))}
                    </div>
                </Section>
            )}

            {favArtists.length === 0 && (
                <div className="text-center py-24 opacity-40">
                    <Star className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                    <p className="font-black text-2xl uppercase italic tracking-tighter">No artists saved yet</p>
                    <p className="text-muted-foreground mt-3 font-medium">Heart artists in the Discover tab to build your highlights</p>
                </div>
            )}

            {favArtists.length > 0 && (
                <Button
                    onClick={share}
                    className="w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.3em] text-base shadow-2xl shadow-primary/20 mt-8 gap-4"
                >
                    <Share2 className="h-6 w-6" />
                    Share My Highlights
                </Button>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
    icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
    return (
        <div className={`${bg} rounded-[2rem] border border-white/5 p-6`}>
            <Icon className={`${color} h-6 w-6 mb-3`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{label}</p>
            <p className={`${color} text-4xl font-black tracking-tighter`}>{value}</p>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-12">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6">{title}</h3>
            {children}
        </section>
    );
}

function GenreDnaCard({ score, uniqueGenreCount, artistCount, topGenres }: {
    score: number;
    uniqueGenreCount: number;
    artistCount: number;
    topGenres: string[];
}) {
    return (
        <section className="mb-12">
            <div
                className="rounded-[2.5rem] p-8 border"
                style={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(250,255,0,0.2)' }}
            >
                <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-6"
                    style={{ color: 'rgba(250,255,0,0.6)' }}>
                    Genre DNA
                </p>

                <div className="flex items-end justify-between mb-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Genre Diversity Score
                    </p>
                    <p className="text-4xl font-black tracking-tighter" style={{ color: '#FAFF00' }}>
                        {score}
                    </p>
                </div>

                <div className="w-full rounded-full overflow-hidden mb-4" style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score}%`, backgroundColor: '#FAFF00' }}
                    />
                </div>

                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-6">
                    You&apos;ve explored {uniqueGenreCount} genre{uniqueGenreCount !== 1 ? 's' : ''} across {artistCount} artist{artistCount !== 1 ? 's' : ''}
                </p>

                {topGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {topGenres.map((g) => (
                            <span
                                key={g}
                                className="px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest"
                                style={{
                                    backgroundColor: 'rgba(250,255,0,0.1)',
                                    color: '#FAFF00',
                                    border: '1px solid rgba(250,255,0,0.3)',
                                }}
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
