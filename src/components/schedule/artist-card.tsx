import type { LineupItem } from '@/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ArtistCardProps {
  artist: LineupItem;
  isFavorite: boolean;
  isConflicting: boolean;
  onToggleFavorite: () => void;
}

export default function ArtistCard({ artist, isFavorite, isConflicting, onToggleFavorite }: ArtistCardProps) {
  const startTime = format(new Date(artist.startTime), 'HH:mm');
  const endTime = format(new Date(artist.endTime), 'HH:mm');
  const duration = (new Date(artist.endTime).getTime() - new Date(artist.startTime).getTime()) / (1000 * 60);

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between overflow-hidden rounded-lg p-2 text-card-foreground shadow-lg transition-all duration-300",
        isFavorite ? "bg-primary text-primary-foreground" : "bg-card",
        isConflicting && "ring-4 ring-destructive",
        duration < 45 && "justify-center",
        "group"
      )}
    >
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className={cn("font-bold", duration < 45 ? 'text-sm' : 'text-base', 'truncate leading-tight')}>
            {artist.artist}
          </h3>
          {artist.countryCode && (
            <span className="text-[10px] bg-foreground/10 px-1 rounded font-medium opacity-70 shrink-0">
              {artist.countryCode}
            </span>
          )}
        </div>
        {duration >= 45 && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase font-semibold tracking-wider opacity-60">
              {startTime} — {endTime}
            </p>
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {artist.genres.slice(0, 2).map((genre) => (
                  <span key={genre} className="text-[9px] bg-foreground/5 px-1.5 py-0.5 rounded-full uppercase font-medium">
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute right-1 top-1 p-1 opacity-50 transition-opacity group-hover:opacity-100"
        aria-label={`Favorite ${artist.artist}`}
      >
        <Heart className={cn("h-5 w-5", isFavorite ? "fill-destructive text-destructive" : "fill-transparent text-current")} />
      </button>
    </div>
  );
}
