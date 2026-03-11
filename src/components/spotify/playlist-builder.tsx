'use client';

import { useState } from 'react';
import { SiSpotify } from 'react-icons/si';
import { ExternalLink, Loader2, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaylistBuilderProps {
    matchedArtistIds: string[];
}

export function PlaylistBuilder({ matchedArtistIds }: PlaylistBuilderProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
    const [trackCount, setTrackCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    const build = async () => {
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await fetch('/api/spotify/build-playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artistIds: matchedArtistIds }),
            });
            if (res.status === 401) { setErrorMsg('Spotify session expired. Please reconnect.'); setStatus('error'); return; }
            if (res.status === 403) { setErrorMsg('Please reconnect Spotify to grant playlist access.'); setStatus('error'); return; }
            if (!res.ok) {
                const { error } = await res.json() as { error: string };
                setErrorMsg(error || 'Something went wrong.');
                setStatus('error');
                return;
            }
            const { playlistUrl: url, trackCount: count } = await res.json() as { playlistUrl: string; trackCount: number };
            setPlaylistUrl(url);
            setTrackCount(count);
            setStatus('done');
        } catch {
            setErrorMsg('Network error. Try again.');
            setStatus('error');
        }
    };

    if (matchedArtistIds.length === 0) return null;

    return (
        <div className="mt-6 p-8 rounded-[2.5rem] bg-[#1DB954]/5 border border-[#1DB954]/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
                <SiSpotify className="text-[#1DB954] h-8 w-8 shrink-0" />
                <div>
                    <h3 className="font-black uppercase text-lg tracking-tighter">Build Playlist</h3>
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">
                        {matchedArtistIds.length} matched artists · up to {matchedArtistIds.length * 3} tracks
                    </p>
                </div>
            </div>

            {status === 'idle' && (
                <Button
                    onClick={build}
                    className="w-full h-16 rounded-[1.5rem] bg-[#1DB954] hover:bg-[#1ed760] text-black font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-[#1DB954]/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <ListMusic className="mr-3 h-5 w-5" />
                    Create "My Sziget 2026 Lineup" Playlist
                </Button>
            )}

            {status === 'loading' && (
                <div className="flex items-center justify-center gap-4 py-6 text-[#1DB954]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-black uppercase tracking-widest text-sm">Building playlist...</span>
                </div>
            )}

            {status === 'done' && playlistUrl && (
                <div className="space-y-4">
                    <p className="text-[#1DB954] font-black uppercase text-sm tracking-widest">
                        ✓ Playlist created — {trackCount} tracks added
                    </p>
                    <Button
                        asChild
                        className="w-full h-16 rounded-[1.5rem] bg-[#1DB954] hover:bg-[#1ed760] text-black font-black uppercase tracking-[0.3em] text-sm shadow-2xl"
                    >
                        <a href={playlistUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-3 h-5 w-5" />
                            Open in Spotify
                        </a>
                    </Button>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-4">
                    <p className="text-red-400 font-bold text-sm">{errorMsg}</p>
                    {(errorMsg.includes('reconnect') || errorMsg.includes('expired')) && (
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-[1.5rem] border-[#1DB954]/20 text-[#1DB954] font-black uppercase tracking-wider text-xs h-12"
                        >
                            <a href="/api/auth/spotify/login">Re-connect Spotify</a>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => setStatus('idle')}
                        className="font-black uppercase tracking-wider text-xs h-10"
                    >
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
}
