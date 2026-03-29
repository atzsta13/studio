'use client';

import { useState, useEffect } from 'react';
import { Heart, Eye, CheckCircle2 } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { useHaptic } from '@/hooks/useHaptic';
import { FESTIVAL } from '@/config/festival';

interface FavoriteButtonProps {
    artistId: string;
    size?: 'sm' | 'lg';
}

const SEEN_KEY = `${FESTIVAL.id}-seen`;

export function FavoriteButton({ artistId, size = 'lg' }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isSeen, setIsSeen] = useState(false);
    const haptic = useHaptic();

    useEffect(() => {
        const raw = localStorage.getItem(SEEN_KEY);
        if (raw) {
            const seen = JSON.parse(raw) as string[];
            setIsSeen(seen.includes(artistId));
        }
    }, [artistId]);

    const handleSeenToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        haptic.lightTap();
        
        const raw = localStorage.getItem(SEEN_KEY);
        const seen = raw ? JSON.parse(raw) as string[] : [];
        const next = isSeen ? seen.filter(id => id !== artistId) : [...seen, artistId];
        
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        setIsSeen(!isSeen);
    };

    const isFave = isFavorite(artistId);

    return (
        <div className="flex gap-3">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    haptic.favoriteTap();
                    toggleFavorite(artistId, 'must_see');
                }}
                className={`flex items-center justify-center rounded-2xl transition-all duration-500 ${
                    size === 'lg' ? 'h-16 px-8' : 'h-12 px-5'
                } ${isFave 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105' 
                    : 'bg-muted/20 border border-white/5 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
            >
                <Heart className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} ${isFave ? 'fill-current' : 'fill-none'} mr-3`} />
                <span className={`font-black uppercase tracking-widest ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
                    {isFave ? 'SAVED' : 'SAVE'}
                </span>
            </button>

            <button
                onClick={handleSeenToggle}
                className={`flex items-center justify-center rounded-2xl transition-all duration-500 ${
                    size === 'lg' ? 'h-16 px-8' : 'h-12 px-5'
                } ${isSeen 
                    ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 shadow-2xl shadow-[#39FF14]/10' 
                    : 'bg-muted/20 border border-white/5 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
            >
                {isSeen ? (
                    <CheckCircle2 className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} mr-3`} />
                ) : (
                    <Eye className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} mr-3`} />
                )}
                <span className={`font-black uppercase tracking-widest ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
                    {isSeen ? 'SEEN' : 'SEEN'}
                </span>
            </button>
        </div>
    );
}
