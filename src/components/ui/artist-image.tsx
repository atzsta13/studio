'use client';

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
  const source = sourceLabel(src);
  return (
    <div className="relative w-full h-full">
      <img src={src} alt={alt} className={className} />
      {source && (
        <span className="absolute bottom-1 right-1 z-20 text-[7px] font-medium text-white/40 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded pointer-events-none select-none">
          © {source}
        </span>
      )}
    </div>
  );
}
