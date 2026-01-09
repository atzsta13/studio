import { notFound } from 'next/navigation';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, ChevronLeft, Building, Music } from 'lucide-react';
import {
  SiSpotify,
  SiApplemusic,
  SiInstagram,
  SiFacebook,
  SiX,
  SiYoutube,
  SiTiktok
} from 'react-icons/si';
import { FaGlobe } from 'react-icons/fa6';

const allArtists: LineupItem[] = lineup as LineupItem[];

export async function generateStaticParams() {
  return allArtists.map((artist) => ({
    id: artist.id,
  }));
}

function getArtist(id: string): LineupItem | undefined {
  return allArtists.find((artist) => artist.id === id);
}

const getFlagEmoji = (countryCode: string | undefined) => {
  if (!countryCode || countryCode === 'Unknown') return '';
  const trimmedCode = countryCode.trim().toUpperCase();
  const code = trimmedCode === 'UK' ? 'GB' : trimmedCode;
  const codePoints = code
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = getArtist(id) as (LineupItem & { vibes?: string[] }) | undefined;

  if (!artist) {
    notFound();
  }

  const startTime = format(new Date(artist.startTime), 'HH:mm');
  const endTime = format(new Date(artist.endTime), 'HH:mm');

  const socialLinks = [
    { platform: 'Spotify', url: artist.socials?.spotify, icon: SiSpotify },
    { platform: 'Apple Music', url: artist.socials?.appleMusic, icon: SiApplemusic },
    { platform: 'Instagram', url: artist.socials?.instagram, icon: SiInstagram },
    { platform: 'Facebook', url: artist.socials?.facebook, icon: SiFacebook },
    { platform: 'X', url: artist.socials?.x, icon: SiX },
    { platform: 'YouTube', url: artist.socials?.youtube, icon: SiYoutube },
    { platform: 'TikTok', url: artist.socials?.tiktok, icon: SiTiktok },
    { platform: 'Website', url: artist.socials?.website, icon: FaGlobe },
  ].filter(link => link.url);

  const spotifyArtistId = artist.socials?.spotify?.split('/artist/')[1]?.split('?')[0];

  // Find similar artists
  const similarArtists = allArtists
    .filter(a => a.id !== artist.id)
    .map(a => {
      let score = 0;
      // Genre matches
      artist.genres?.forEach(g => {
        if (a.genres?.includes(g) && g !== 'MUSIC') score += 2;
      });
      // Vibe matches
      artist.vibes?.forEach(v => {
        if ((a as any).vibes?.includes(v)) score += 3;
      });
      return { artist: a, score };
    })
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href="/discover" className="hover:text-primary transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Music Finder
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left column: Image and basic info */}
        <div className="lg:col-span-5">
          {artist.imageUrl && (
            <div className="overflow-hidden rounded-2xl bg-muted shadow-xl mb-6">
              <img
                src={artist.imageUrl}
                alt={artist.artist}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {artist.vibes?.map(vibe => (
                <Badge key={vibe} variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                  {vibe}
                </Badge>
              ))}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Day</p>
                    <p className="font-semibold">{artist.day}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Time</p>
                    <p className="font-semibold">{startTime} - {endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Stage</p>
                    <p className="font-semibold">{artist.stage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Description and Socials */}
        <div className="lg:col-span-7">
          <header className="mb-6">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-3 mb-2">
              <span suppressHydrationWarning>{getFlagEmoji(artist.countryCode)}</span>
              <span>{artist.artist}</span>
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {artist.genres?.filter(g => g !== 'MUSIC').map(genre => (
                <Badge key={genre} variant="secondary" className="px-3">{genre}</Badge>
              ))}
            </div>
          </header>

          <article className="prose prose-invert max-w-none mb-10">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {artist.description || "No description available for this artist yet."}
            </p>
          </article>

          {socialLinks.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 font-bold text-lg">Artist Presence</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map(link => (
                  <Button asChild variant="outline" size="icon" key={link.platform} className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
                      <link.icon className="h-6 w-6" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button asChild size="lg" className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20">
            <Link href={`/schedule?day=${artist.day}`}>
              Add to my Schedule
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t pt-12">
        {/* Recommended Artists */}
        <section>
          <h3 className="mb-6 text-2xl font-bold">More like {artist.artist}</h3>
          <div className="grid grid-cols-1 gap-4">
            {similarArtists.length > 0 ? (
              similarArtists.map(({ artist: similar }) => (
                <Link
                  key={similar.id}
                  href={`/artist/${similar.id}`}
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {similar.imageUrl ? (
                      <img src={similar.imageUrl} alt={similar.artist} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center"><Music className="h-8 w-8 text-muted-foreground/20" /></div>
                    )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{similar.artist}</h4>
                    <p className="text-sm text-muted-foreground truncate">{similar.stage} &bull; {similar.day}</p>
                    <div className="mt-2 flex gap-1">
                      {similar.genres?.filter(g => g !== 'MUSIC').slice(0, 2).map(g => (
                        <span key={g} className="text-[10px] uppercase font-bold text-primary/70">{g}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground">We're still hunting for similar vibes.</p>
            )}
          </div>
        </section>

        {/* Music Player */}
        <section>
          <h3 className="mb-6 text-2xl font-bold text-center lg:text-left">Listen to the latest</h3>
          {spotifyArtistId ? (
            <div className="w-full">
              <iframe
                src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
                width="100%"
                height="320"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl shadow-xl bg-muted"
              ></iframe>
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl bg-muted border border-dashed text-center p-8">
              <SiSpotify className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Spotify link unavailable for this artist.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}