'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FESTIVAL } from '@/config/festival';

interface PlaylistBuilderProps {
    matchedArtistIds: string[];
}

export function PlaylistBuilder({ matchedArtistIds }: PlaylistBuilderProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    const buildPlaylist = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/spotify/build-playlist', {
                method: 'POST',
                body: JSON.stringify({ artistIds: matchedArtistIds }),
            });

            if (res.status === 403) {
                toast({
                    title: "PERMISSIONS NEEDED",
                    description: "Re-connect Spotify and check 'Manage playlists'.",
                    variant: "destructive"
                });
                return;
            }

            if (!res.ok) throw new Error('Build failed');

            const { playlistUrl } = await res.json();
            setSuccess(true);
            window.open(playlistUrl, '_blank');
            toast({
                title: "PLAYLIST CREATED",
                description: `Your ${FESTIVAL.name} lineup is now on Spotify!`
            });
        } catch (err) {
            toast({
                title: "ERROR",
                description: "Failed to generate playlist.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-8 h-16 rounded-[1.5rem] border border-emerald-500/20 font-black uppercase tracking-[0.2em] text-[11px]">
                <CheckCircle2 size={18} />
                Playlist Ready
            </div>
        );
    }

    return (
        <button
            onClick={buildPlaylist}
            disabled={loading}
            className="flex items-center justify-center rounded-[1.5rem] h-16 px-10 bg-[#1DB954] hover:bg-[#1ed760] text-white font-black uppercase tracking-[0.25em] gap-4 shadow-2xl shadow-[#1DB954]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <Music className="h-6 w-6" />
            )}
            CREATE &quot;MY {FESTIVAL.name.toUpperCase()} {FESTIVAL.dates.year}&quot; PLAYLIST
        </button>
    );
}
