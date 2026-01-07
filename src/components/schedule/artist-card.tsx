import type { LineupItem } from '@/types';
import { Heart, Clock } from 'lucide-react';
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
        "group absolute inset-1 flex flex-col justify-between overflow-hidden rounded-md p-2 text-card-foreground shadow-lg transition-all duration-300",
        isFavorite ? "bg-primary/90 text-primary-foreground" : "bg-card/80 backdrop-blur-sm",
        isConflicting && "ring-4 ring-destructive/80",
        duration < 45 && "justify-center",
        "hover:scale-[1.02] hover:shadow-primary/20 hover:z-10"
      )}
    >
      <div>
        <div className="flex justify-between items-start">
            <h3 className={cn(
                "font-bold leading-tight pr-5",
                duration < 40 && 'text-xs',
                duration >= 40 && duration < 60 && 'text-sm',
                duration >= 60 && 'text-base',
            )}>
                {artist.artist}
            </h3>
            <button
                onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
                }}
                className="absolute right-1.5 top-1.5 p-0.5 opacity-60 transition-opacity group-hover:opacity-100"
                aria-label={`Favorite ${artist.artist}`}
            >
                <Heart className={cn("h-5 w-5 transition-all", isFavorite ? "fill-destructive text-destructive" : "fill-transparent text-current group-hover:text-destructive")} />
            </button>
        </div>

        {duration >= 45 && (
            <p className={cn(
                "text-xs opacity-70 mt-1 flex items-center gap-1",
                isFavorite && "opacity-100",
            )}>
              <Clock className="h-3 w-3"/>
              {startTime} – {endTime}
            </p>
        )}
      </div>

      {artist.genres && artist.genres.length > 0 && duration >= 60 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {artist.genres.slice(0, 2).map((genre) => (
            <span key={genre} className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-full uppercase font-medium",
                isFavorite ? 'bg-primary-foreground/20' : 'bg-foreground/10'
            )}>
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
