import { notFound } from 'next/navigation';
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

const allArtists: LineupItem[] = lineup as unknown as LineupItem[];

export async function generateStaticParams() {
  return allArtists.map((artist) => ({
    id: artist.id,
  }));
}

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

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
        <Button asChild variant="ghost" className="rounded-xl">
          <Link href="/discover" className="hover:text-primary transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Finder
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-5">
          {artist.imageUrl && (
            <div className="overflow-hidden rounded-[2.5rem] bg-muted shadow-xl mb-6 border border-border/50">
              <img src={artist.imageUrl} alt={artist.artist} className="w-full h-auto object-cover aspect-square" />
            </div>
          )}

          <div className="rounded-[2rem] border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div><p className="text-[10px] font-black uppercase text-muted-foreground">Day</p><p className="font-semibold">{artist.day || 'TBD'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div><p className="text-[10px] font-black uppercase text-muted-foreground">Time</p><p className="font-semibold">{artist.startTime ? `${startTime} - ${endTime}` : 'Schedule TBA'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-primary" />
              <div><p className="text-[10px] font-black uppercase text-muted-foreground">Stage</p><p className="font-semibold">{artist.stage || 'TBA'}</p></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <header className="mb-6">
            <h1 className="font-headline text-4xl font-black tracking-tight flex items-center gap-3 mb-2 uppercase italic leading-none">
              <span suppressHydrationWarning className="drop-shadow-lg">{getFlagEmoji(artist.countryCode)}</span>
              <span>{artist.artist}</span>
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {artist.genres?.filter(g => g !== 'MUSIC').map(genre => (
                <Badge key={genre} variant="secondary" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-full">{genre}</Badge>
              ))}
            </div>
          </header>

          <article className="prose prose-invert max-w-none mb-8">
            <p className="text-muted-foreground leading-relaxed text-lg font-medium opacity-90">
              {artist.description || "No description available for this artist yet. Stay tuned for the scout report."}
            </p>
          </article>



          <div className="flex flex-wrap gap-4 mb-8">
            {socialLinks.map(link => (
              <Button asChild variant="outline" size="icon" key={link.platform} className="h-12 w-12 rounded-2xl hover:bg-primary hover:text-white transition-all border-border shadow-sm">
                <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
                  <link.icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>

          {/* Two-tier favorites + saw this set */}
          <div className="mb-8">
            <FavoriteButton artistId={artist.id} />
          </div>

          <Button asChild size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-sm">
            <Link href={`/timetable?day=${artist.day || ''}`}>Add to My Timetable</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-border/50 pt-12">
        <section>
          <h3 className="mb-8 text-2xl font-black uppercase italic tracking-tighter">Vibe Radar</h3>
          <div className="flex flex-wrap gap-3 mb-12">
            {artist.vibes?.map(vibe => (
              <Badge key={vibe} variant="outline" className="px-5 py-2.5 border-primary/30 text-primary font-black uppercase tracking-widest text-[9px] rounded-full">
                {vibe}
              </Badge>
            )) || <p className="text-muted-foreground font-medium">Scouting vibes...</p>}
          </div>

          <h3 className="mb-8 text-2xl font-black uppercase italic tracking-tighter">Similar Acts</h3>
          <div className="grid grid-cols-2 gap-4">
            {similar.map(a => (
              <Link key={a.id} href={`/artist/${a.id}`} className="group block">
                <div className="aspect-square rounded-[2rem] bg-muted overflow-hidden mb-3 relative border border-border/50 shadow-md">
                  <img src={a.imageUrl} alt={a.artist} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <UserPlus className="text-white h-8 w-8" />
                  </div>
                </div>
                <p className="font-black uppercase italic text-[10px] tracking-tight truncate px-2">{a.artist}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-8 text-2xl font-black uppercase italic tracking-tighter">Island Listen</h3>
          {spotifyArtistId ? (
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted border border-border/50">
              <iframe
                src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
                width="100%" height="380" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
                className="opacity-95"
              ></iframe>
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-[2.5rem] bg-muted border border-dashed border-border text-center p-12">
              <SiSpotify className="h-16 w-16 text-muted-foreground/10 mb-6" />
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-60">Spotify ID Not Linked for this Artist</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
