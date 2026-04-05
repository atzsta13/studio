
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import Link from 'next/link';

interface SpotifyConnectProps {
    onMatchesFound: (ids: string[]) => void;
}

export function SpotifyConnect({ onMatchesFound }: SpotifyConnectProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const [matchCount, setMatchCount] = useState(0);

    const checkMatches = async () => {
        console.log('Checking for Spotify matches...');
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/spotify/matches');
            console.log('Matches API status:', res.status);

            if (res.status === 401) {
                console.log('Not authorized with Spotify');
                setConnected(false);
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch matches');

            const data = await res.json();
            console.log('Matches found:', data.matches.length);
            console.log('Matched Artists:', data.debugMatches);
            setConnected(true);
            setMatchCount(data.matches.length);
            onMatchesFound(data.matches);
        } catch (err) {
            console.error('Error checking matches:', err);
            setError('Could not connect to Spotify');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkMatches();
    }, []);

    const handleConnect = () => {
        console.log('Starting Spotify auth flow...');
        window.location.href = '/api/auth/spotify/login';
    };

    if (loading) {
        return (
            <Button disabled variant="secondary" className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking Spotify...
            </Button>
        );
    }

    if (connected) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-500 font-medium bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <Check className="h-4 w-4" />
                Spotify Connected ({matchCount} matches)
            </div>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold gap-2"
        >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.48-.6 13.26 1.74.42.24.6.84.48 1.08zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Sync Lineup
        </Button>
    );
}
