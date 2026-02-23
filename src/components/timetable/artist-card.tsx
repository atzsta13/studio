import { Box, Typography, IconButton } from '@mui/material';
import { Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { LineupItem } from '@/types';
import Link from 'next/link';

interface ArtistCardProps {
  artist: LineupItem;
  isFavorite: boolean;
  isConflicting: boolean;
  onToggleFavorite: () => void;
}

export default function ArtistCard({ artist, isFavorite, isConflicting, onToggleFavorite }: ArtistCardProps) {
  const start = new Date(artist.startTime);
  const startTime = format(start, 'HH:mm');
  const duration = (new Date(artist.endTime).getTime() - start.getTime()) / (1000 * 60);

  const isSmall = duration < 40;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: '1px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isSmall ? 'center' : 'space-between',
        p: 1.5,
        borderRadius: 0.5,
        bgcolor: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.05)',
        borderLeft: isFavorite ? '3px solid #ff0080' : isConflicting ? '3px solid #ef4444' : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.1s ease',
        cursor: 'default',
        boxShadow: isFavorite ? '0 0 15px rgba(255,0,128,0.1)' : 'none',
        '&:hover': {
          bgcolor: '#111',
          borderColor: 'rgba(255,255,255,0.2)',
          zIndex: 50,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box 
          onClick={onToggleFavorite}
          sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
        >
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 900,
              fontSize: isSmall ? '0.75rem' : '0.9rem',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
            }}
          >
            {artist.artist}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.65rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              mt: 0.5,
            }}
          >
            {startTime}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {isFavorite && (
            <Heart size={14} fill="#ff0080" color="#ff0080" style={{ marginTop: 2 }} />
          )}
          {!isSmall && (
            <Link href={`/map?stage=${encodeURIComponent(artist.stage)}`} style={{ textDecoration: 'none' }}>
              <IconButton size="small" sx={{ p: 0.5, color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#00f2ff' } }}>
                <MapPin size={12} />
              </IconButton>
            </Link>
          )}
        </Box>
      </Box>

      {!isSmall && artist.genres?.[0] && (
        <Typography
          sx={{
            fontSize: '0.55rem',
            fontWeight: 900,
            color: isFavorite ? '#ff0080' : '#00f2ff',
            letterSpacing: '0.1em',
            mt: 'auto',
          }}
        >
          {artist.genres[0].toUpperCase()}
        </Typography>
      )}
    </Box>
  );
}
