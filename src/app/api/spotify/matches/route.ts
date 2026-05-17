// SUSPENDED: Spotify API access paused. See docs/features/SPOTIFY_INTEGRATION.md

import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import lineup from '@/data/lineup.json';
import { FESTIVAL } from '@/config/festival-engine';
import type { LineupItem } from '@/types';

interface SpotifyTrackItem {
  track: {
    artists: Array<{ id: string; name: string }>;
  } | null;
}

// Helper to extract Spotify Artist ID
function getSpotifyId(url: string | null): string | null {
    if (!url) return null;
    const match = url.match(/artist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

// Build map of Spotify Artist ID -> Festival Artist ID
const spotifyMap = new Map<string, string>();
(lineup as unknown as LineupItem[]).forEach((artist) => {
    const spotifyId = getSpotifyId(artist.socials?.spotify ?? null);
    if (spotifyId) {
        spotifyMap.set(spotifyId, artist.id);
    }
});

const FestivalArtistIds = new Set(spotifyMap.keys());

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('spotify_access_token');

    if (!token?.value) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const accessToken = token.value;
        const limit = 50;
        let offset = 0;
        const matches = new Set<string>(); // Set of Festival Artist IDs

        // Fetch tracks logic
        // We'll fetch pages until we check enough or all
        // Let's implement fetching logic
        // fetch initial to get total
        const initialUrl = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`;

        const headers = { Authorization: `Bearer ${accessToken}` };

        // Helper for fetching
        const fetchPage = async (url: string) => {
            const res = await fetch(url, { headers });
            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('Unauthorized');
                }
                throw new Error(`Spotify API error: ${res.status}`);
            }
            return res.json();
        };

        const firstPage = await fetchPage(initialUrl);
        const total = firstPage.total;
        const items = firstPage.items || [];

        const debugMatches: { id: string, name: string }[] = [];

        // Process first page
        const processItems = (trackItems: SpotifyTrackItem[]) => {
            trackItems.forEach((item) => {
                const track = item.track;
                if (!track || !track.artists) return;
                track.artists.forEach((artist) => {
                    if (FestivalArtistIds.has(artist.id)) {
                        const festivalId = spotifyMap.get(artist.id);
                        if (festivalId) {
                            if (!matches.has(festivalId)) {
                                debugMatches.push({ id: festivalId, name: artist.name });
                            }
                            matches.add(festivalId);
                        }
                    }
                });
            });
        };

        processItems(items);

        // If more pages, fetch them in parallel batches
        // Limit to checking max 1000 songs for performance (20 pages)
        // Adjust as needed.
        const MAX_SONGS_TO_CHECK = 1000;
        const pagesToFetch = Math.min(Math.ceil((total - limit) / limit), Math.ceil((MAX_SONGS_TO_CHECK - limit) / limit));

        if (pagesToFetch > 0) {
            const promises = [];
            for (let i = 1; i <= pagesToFetch; i++) {
                const nextOffset = i * limit;
                const pageUrl = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${nextOffset}`;
                promises.push(fetchPage(pageUrl));
            }

            // Execute in parallel
            const results = await Promise.all(promises);
            results.forEach((pageData) => {
                if (pageData.items) {
                    processItems(pageData.items);
                }
            });
        }

        console.log(`Checked ${Math.min(total, MAX_SONGS_TO_CHECK)} songs. Found ${matches.size} matches.`);
        console.log('Matches:', debugMatches);

        return NextResponse.json({
            matches: Array.from(matches),
            debugMatches,
            totalChecked: Math.min(total, MAX_SONGS_TO_CHECK), // Approx
            hasMore: total > MAX_SONGS_TO_CHECK
        });

    } catch (error) {
        console.error('Error fetching matches:', error);
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
