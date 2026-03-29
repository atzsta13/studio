'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Music, Eye, Heart, Zap, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FESTIVAL } from '@/config/festival';

interface Achievement {
    id: string;
    title: string;
    desc: string;
    icon: any;
    unlocked: boolean;
}

const FAVORITES_V2_KEY = `${FESTIVAL.id}-favorites-v2`;
const FAVORITES_V1_KEY = `${FESTIVAL.id}-favorites`;
const SEEN_KEY = `${FESTIVAL.id}-seen`;

export function AchievementBadges() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    useEffect(() => {
        // Calculate achievements from localStorage
        const favsRaw = localStorage.getItem(FAVORITES_V2_KEY) || localStorage.getItem(FAVORITES_V1_KEY);
        const favsCount = favsRaw ? Object.keys(JSON.parse(favsRaw)).length : 0;
        
        const seenRaw = localStorage.getItem(SEEN_KEY);
        const seenCount = seenRaw ? JSON.parse(seenRaw).length : 0;

        const list: Achievement[] = [
            { id: 'first', title: 'First Love', desc: 'Save your first artist', icon: Heart, unlocked: favsCount >= 1 },
            { id: 'scout', title: 'Headliner Hunter', desc: 'Save 3+ headliners', icon: Star, unlocked: favsCount >= 3 }, // Simplified check
            { id: 'explorer', title: 'Explorer', desc: 'Save 10+ artists', icon: Zap, unlocked: favsCount >= 10 },
            { id: 'witness', title: 'Witness', desc: 'Mark 3+ acts as seen', icon: Eye, unlocked: seenCount >= 3 },
            { id: 'legend', title: 'Festival Legend', desc: 'Save 20+ artists', icon: Trophy, unlocked: favsCount >= 20 },
        ];

        setAchievements(list);
    }, []);

    if (achievements.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center gap-6 mb-10">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Tactical Merits</h3>
                <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {achievements.map((ach) => (
                    <Card key={ach.id} className={`bg-card/50 border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${ach.unlocked ? 'opacity-100 scale-100' : 'opacity-40 grayscale blur-[1px] hover:grayscale-0 hover:blur-0'}`}>
                        <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                                <div className={`p-4 rounded-2xl shadow-inner ${ach.unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {ach.unlocked ? <ach.icon size={28} /> : <Lock size={28} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-black text-lg uppercase italic tracking-tighter">{ach.title}</h4>
                                        {ach.unlocked && <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black tracking-widest px-2 py-0.5 rounded">UNLOCKED</Badge>}
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed opacity-70 italic">{ach.desc}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
