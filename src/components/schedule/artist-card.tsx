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
      <div>
        <h3 className={cn("font-bold", duration < 45 ? 'text-sm' : 'text-base', 'truncate')}>{artist.artist}</h3>
        {duration >= 45 && <p className="text-xs opacity-80">{startTime} - {endTime}</p>}
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
