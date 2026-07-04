import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { LineupItem } from '@/types';
import Link from 'next/link';
import { getFestivalConfig } from '@/config/festival-engine';

interface ArtistCardProps {
  artist: LineupItem;
  festivalId: string;
  isFavorite: boolean;
  favoriteTier?: 'must_see' | 'interested' | null;
  isConflicting: boolean;
  isLive?: boolean;
  isPast?: boolean;
  onToggleFavorite: () => void;
}

const LIVE_HEX = '#22c55e';

export default function ArtistCard({
  artist,
  festivalId,
  isFavorite,
  favoriteTier,
  isConflicting,
  isLive = false,
  isPast = false,
  onToggleFavorite
}: ArtistCardProps) {
  if (!artist.startTime || !artist.endTime) return null;

  const festivalConfig = getFestivalConfig(festivalId);
  const favColor = favoriteTier === 'must_see'
    ? festivalConfig.theme.primaryHex
    : (festivalConfig.theme.secondaryHex || festivalConfig.theme.accentHex);

  const start = new Date(artist.startTime);
  const end = new Date(artist.endTime);
  const startTime = format(start, 'HH:mm');
  const endTime = format(end, 'HH:mm');
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);

  const isTiny = duration < 25;
  const isSmall = duration < 40;

  const borderLeft = isConflicting
    ? '4px solid #ef4444'
    : isLive
      ? `4px solid ${LIVE_HEX}`
      : isFavorite
        ? `4px solid ${favColor}`
        : '1px solid rgba(255,255,255,0.06)';

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: '1px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isSmall ? 'center' : 'space-between',
        p: isTiny ? 0.5 : 1.5,
        borderRadius: '0.75rem',
        bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.1)' : isLive ? 'rgba(34, 197, 94, 0.08)' : festivalConfig.theme.backgroundHex,
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft,
        opacity: isPast && !isFavorite && !isConflicting ? 0.4 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        boxShadow: isConflicting
          ? '0 10px 30px rgba(239, 68, 68, 0.2)'
          : isLive
            ? `0 0 0 1px ${LIVE_HEX}, 0 10px 30px rgba(34, 197, 94, 0.25)`
            : isFavorite
              ? favoriteTier === 'must_see'
                ? `0 10px 30px ${festivalConfig.theme.glowColor}`
                : `0 10px 30px rgba(0, 195, 255, 0.15)`
              : 'none',
        '&:hover': {
          bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.2)' : festivalConfig.theme.backgroundHex,
          borderColor: isConflicting ? '#ef4444' : isFavorite ? favColor : 'rgba(255,255,255,0.2)',
          zIndex: 50,
          transform: 'scale(1.02)'
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: isTiny ? 'center' : 'flex-start', gap: 0.5 }}>
        <Link
          href={`/${festivalId}/artist/${artist.id}`}
          style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          <Typography
            sx={{
              color: isConflicting ? '#ef4444' : '#fff',
              fontWeight: 900,
              fontSize: isTiny ? '0.7rem' : isSmall ? '0.8rem' : '1rem',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              '&:hover': { color: festivalConfig.theme.primaryHex }
            }}
          >
            {artist.artist}
          </Typography>
          {!isTiny && (
            <Typography
              sx={{
                color: isConflicting ? 'rgba(239, 68, 68, 0.8)' : isLive ? LIVE_HEX : 'rgba(255,255,255,0.4)',
                fontSize: '0.7rem',
                fontWeight: 800,
                fontFamily: '"Outfit", sans-serif',
                mt: 0.5,
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <span>{startTime}–{endTime}</span>
              {isLive && (
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: LIVE_HEX, fontWeight: 900, letterSpacing: '0.1em' }}>
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: LIVE_HEX, animation: 'ttPulse 1.4s ease-in-out infinite', '@keyframes ttPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                  NOW
                </Box>
              )}
              {isConflicting && "(!)"}
            </Typography>
          )}
        </Link>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
          <Box
            onClick={onToggleFavorite}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', p: 0.25 }}
          >
            {isFavorite
              ? <Heart size={isTiny ? 12 : 16} fill={favColor} color={favColor} />
              : !isTiny && <Heart size={14} color="rgba(255,255,255,0.15)" style={{ display: 'block' }} />
            }
          </Box>
          {!isSmall && (
            <Link href={`/map?stage=${encodeURIComponent(artist.stage || "")}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
              <IconButton size="small" aria-label="View on map" sx={{ p: 0.5, color: 'rgba(255,255,255,0.2)', '&:hover': { color: festivalConfig.theme.secondaryHex } }}>
                <MapPin size={14} />
              </IconButton>
            </Link>
          )}
        </Box>
      </Box>

      {!isSmall && artist.genres?.[0] && (
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 900,
            color: isFavorite ? favColor : festivalConfig.theme.secondaryHex,
            letterSpacing: '0.2em',
            mt: 'auto',
            opacity: 0.8
          }}
        >
          {artist.genres[0].toUpperCase()}
        </Typography>
      )}
    </Box>
  );
}
