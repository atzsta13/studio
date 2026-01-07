import { notFound } from 'next/navigation';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, Globe, Instagram, Mic, Music, Twitter, Youtube, Facebook, ExternalLink, ChevronLeft, Building } from 'lucide-react';

const allArtists: LineupItem[] = lineup as LineupItem[];

export async function generateStaticParams() {
  return allArtists.map((artist) => ({
    id: artist.id,
  }));
}

function getArtist(id: string): LineupItem | undefined {
  return allArtists.find((artist) => artist.id === id);
}

export default function ArtistDetailPage({ params }: { params: { id: string } }) {
  const artist = getArtist(params.id);

  if (!artist) {
    notFound();
  }

  const startTime = format(new Date(artist.startTime), 'HH:mm');
  const endTime = format(new Date(artist.endTime), 'HH:mm');

  const socialLinks = [
    { platform: 'Spotify', url: artist.socials?.spotify, icon: Music },
    { platform: 'Instagram', url: artist.socials?.instagram, icon: Instagram },
    { platform: 'Facebook', url: artist.socials?.facebook, icon: Facebook },
    { platform: 'Twitter', url: artist.socials?.twitter, icon: Twitter },
    { platform: 'YouTube', url: artist.socials?.youtube, icon: Youtube },
    { platform: 'Website', url: artist.socials?.website, icon: ExternalLink },
    { platform: 'TikTok', url: artist.socials?.tiktok, icon: Globe },
  ].filter(link => link.url);

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
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {artist.artist}
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
            <h3 className="mb-2 font-semibold text-lg">Follow them</h3>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(link => (
                <Button asChild variant="outline" key={link.platform}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.platform}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Button asChild>
          <Link href={`/schedule?day=${artist.day}`}>
            View on Schedule
          </Link>
        </Button>
      </div>
    </div>
  );
}