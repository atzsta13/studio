import { notFound } from 'next/navigation';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, ChevronLeft, Building } from 'lucide-react';
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

export default function ArtistDetailPage({ params }: { params: { id: string } }) {
  const artist = getArtist(params.id);

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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href="/discover">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Discover
          </Link>
        </Button>
      </div>

      {artist.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-xl bg-muted shadow-2xl">
          <img
            src={artist.imageUrl}
            alt={artist.artist}
            className="w-full object-cover max-h-[400px]"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-3">
          <span suppressHydrationWarning>{getFlagEmoji(artist.countryCode)}</span>
          <span>{artist.artist}</span>
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> <span>{artist.day}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> <span>{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" /> <span>{artist.stage}</span>
          </div>
        </div>
      </header>

      <article className="prose prose-invert max-w-none text-foreground prose-p:text-muted-foreground">
        {artist.description ? (
          <p>{artist.description}</p>
        ) : (
          <p>No description available for this artist yet.</p>
        )}
      </article>



      <div className="my-8 space-y-4">
        <div>
          <h3 className="mb-2 font-semibold text-lg">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {artist.genres?.map(genre => (
              <Badge key={genre} variant="secondary">{genre}</Badge>
            ))}
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div>
            <h3 className="mb-4 font-semibold text-lg">Official Links</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(link => (
                <Button asChild variant="outline" size="icon" key={link.platform} className="rounded-full hover:bg-primary/10 hover:border-primary transition-all">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
                    <link.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-6 flex flex-col gap-8">
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/schedule?day=${artist.day}`}>
            View on Schedule
          </Link>
        </Button>

        {spotifyArtistId && (
          <div className="w-full">
            <iframe
              src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl shadow-lg"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}