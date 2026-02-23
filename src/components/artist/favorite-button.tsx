'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { useEffect, useState } from 'react';

interface FavoriteButtonProps {
  artistId: string;
}

export function FavoriteButton({ artistId }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useFavorites([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-12 w-12 rounded-2xl bg-muted" />;

  const isFave = favorites.has(artistId);

  return (
    <Button
      variant={isFave ? 'default' : 'outline'}
      size="icon"
      onClick={() => toggleFavorite(artistId)}
      className={`h-12 w-12 rounded-2xl transition-all shadow-lg ${
        isFave ? 'bg-primary border-primary hover:bg-primary/90' : 'border-border bg-card'
      }`}
    >
      <Heart 
        className={`h-5 w-5 ${isFave ? 'fill-white text-white' : 'text-muted-foreground'}`} 
      />
    </Button>
  );
}
