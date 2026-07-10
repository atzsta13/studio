'use client';
import { useState } from 'react';

interface ArtistImageProps {
  src: string;
  alt: string;
  className?: string;
}

function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function ArtistImage({ src, alt, className }: ArtistImageProps) {
  const [hasError, setHasError] = useState(false);
  const source = sourceLabel(src);

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 border border-white/5 ${className}`}>
        <span className="font-headline font-black italic text-5xl opacity-20 text-muted-foreground uppercase select-none">
          {alt ? alt.trim().slice(0, 1) : '?'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
      {source && (
        <span className="absolute bottom-1 right-1 z-20 text-[7px] font-medium text-white/40 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded pointer-events-none select-none">
          © {source}
        </span>
      )}
    </div>
  );
}
