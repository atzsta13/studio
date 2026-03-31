'use client';

import { useParams, notFound } from 'next/navigation';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronLeft,
  Building,
  Sparkles,
  UserPlus,
} from 'lucide-react';
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
import { FavoriteButton } from '@/components/artist/favorite-button';
import { ArtistTrivia } from '@/components/artist/artist-trivia';
import { SetCountdown } from '@/components/artist/set-countdown';
import { SetlistLinks } from '@/components/artist/setlist-links';
import { FESTIVAL } from '@/config/festival';

const allArtists: LineupItem[] = lineup as unknown as LineupItem[];

function getArtist(id: string): LineupItem | undefined {
  return allArtists.find((artist) => artist.id === id);
}

function getSimilarArtists(artist: LineupItem) {
  if (!artist.genres) return [];
  return allArtists
    .filter(a => a.id !== artist.id && a.genres?.some(g => artist.genres?.includes(g)))
    .slice(0, 4);
}

const getFlagEmoji = (countryCode: string | undefined) => {
  if (!countryCode || countryCode === 'Unknown') return '';
  const trimmedCode = countryCode.trim().toUpperCase();
  const code = trimmedCode === 'UK' ? 'GB' : trimmedCode;
  try {
    const codePoints = code
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) { return ''; }
};

export default function ArtistDetailPage() {
  const { id } = useParams() as { id: string };
  const artist = getArtist(id) as (LineupItem & { vibes?: string[] }) | undefined;

  if (!artist) {
    notFound();
  }

  const similar = getSimilarArtists(artist);
  const startTime = artist.startTime ? format(new Date(artist.startTime), 'HH:mm') : 'TBA';
  const endTime = artist.endTime ? format(new Date(artist.endTime), 'HH:mm') : 'TBA';

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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 pb-32">
      <div className="mb-6 flex justify-between items-center">
        <Button asChild variant="ghost" className="rounded-xl text-muted-foreground">
          <Link href="/discover" className="hover:text-primary transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Finder
          </Link>
        </Button>
      </div>

      {FESTIVAL.features.setCountdowns && artist.startTime && (
        <div className="mb-8">
           <SetCountdown startTime={artist.startTime} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-5">
          {artist.imageUrl && (
            <div className="overflow-hidden rounded-[2.5rem] bg-muted shadow-xl mb-6 border border-border/50 group relative">
              <img src={artist.imageUrl} alt={artist.artist} className="w-full h-auto object-cover aspect-square transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <div className="rounded-[2rem] border bg-card/50 backdrop-blur-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Day</p><p className="font-black italic">{artist.day || 'TBD'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Clock className="h-5 w-5" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Time</p><p className="font-black italic">{artist.startTime ? `${startTime} - ${endTime}` : 'Schedule TBA'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Building className="h-5 w-5" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stage</p><p className="font-black italic uppercase">{artist.stage || 'TBA'}</p></div>
            </div>
          </div>

          {FESTIVAL.features.artistTrivia && (
            <ArtistTrivia artistName={artist.artist} description={artist.description || ''} />
          )}

          {FESTIVAL.features.setlistLinks && (
            <SetlistLinks artistName={artist.artist} />
          )}
        </div>

        <div className="lg:col-span-7">
          <header className="mb-6">
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter flex items-center gap-4 mb-4 uppercase italic leading-none">
              <span suppressHydrationWarning className="drop-shadow-2xl">{getFlagEmoji(artist.countryCode)}</span>
              <span>{artist.artist}</span>
            </h1>
            <div className="flex flex-wrap gap-2 mb-8">
              {artist.genres?.filter(g => g !== 'MUSIC').map(genre => (
                <Badge key={genre} variant="secondary" className="px-5 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full bg-white/5 border border-white/5">{genre}</Badge>
              ))}
            </div>
          </header>

          <article className="prose prose-invert max-w-none mb-12">
            <p className="text-muted-foreground leading-relaxed text-xl font-medium opacity-90 italic">
              {artist.description || "No description available for this artist yet. Stay tuned for the scout report."}
            </p>
          </article>

          <div className="flex flex-wrap gap-4 mb-10">
            {socialLinks.map(link => (
              <Button asChild variant="outline" size="icon" key={link.platform} className="h-14 w-14 rounded-2xl hover:bg-primary hover:text-white transition-all border-white/5 bg-white/5 shadow-2xl">
                <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
                  <link.icon className="h-6 w-6" />
                </a>
              </Button>
            ))}
          </div>

          <div className="mb-10">
            <FavoriteButton artistId={artist.id} />
          </div>

          <Button asChild size="lg" className="w-full h-20 rounded-[2rem] shadow-2xl shadow-primary/20 font-black uppercase tracking-[0.3em] text-base transition-all hover:scale-[1.02] active:scale-95">
            <Link href={`/timetable?day=${artist.day || ''}`}>Add to My Timetable</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-white/5 pt-12">
        <section>
          <h3 className="mb-8 text-3xl font-black uppercase italic tracking-tighter">Vibe Radar</h3>
          <div className="flex flex-wrap gap-3 mb-16">
            {artist.vibes?.map(vibe => (
              <Badge key={vibe} variant="outline" className="px-6 py-3 border-primary/30 text-primary font-black uppercase tracking-widest text-[10px] rounded-full bg-primary/5">
                {vibe}
              </Badge>
            )) || <p className="text-muted-foreground font-medium italic">Scouting vibes...</p>}
          </div>

          {FESTIVAL.features.similarArtists && (
            <>
              <h3 className="mb-8 text-3xl font-black uppercase italic tracking-tighter">Similar Acts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {similar.map(a => (
                  <Link key={a.id} href={`/artist/${a.id}`} className="group block">
                    <div className="aspect-square rounded-[2rem] bg-muted overflow-hidden mb-3 relative border border-white/5 shadow-2xl">
                      <img src={a.imageUrl} alt={a.artist} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <UserPlus className="text-white h-10 w-10" />
                      </div>
                    </div>
                    <p className="font-black uppercase italic text-[10px] tracking-tight truncate px-2 text-center">{a.artist}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <section>
          <h3 className="mb-8 text-3xl font-black uppercase italic tracking-tighter">Island Listen</h3>
          {spotifyArtistId ? (
            <div className="rounded-[3rem] overflow-hidden shadow-2xl bg-black border border-white/5 p-4">
              <iframe
                src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
                width="100%" height="380" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
                className="rounded-[2.5rem]"
              ></iframe>
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-[3rem] bg-muted/20 border border-dashed border-white/10 text-center p-12">
              <SiSpotify className="h-16 w-16 text-muted-foreground/10 mb-6" />
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-60 italic">Spotify ID Not Linked</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
