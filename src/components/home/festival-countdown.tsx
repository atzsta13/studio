'use client';

import { useEffect, useState } from 'react';
import { getFestivalConfig } from '@/config/festival-engine';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function FestivalCountdown({ festivalId }: { festivalId: string }) {
  const config = getFestivalConfig(festivalId);
  const FESTIVAL_START = new Date(`${config.dates.startDate}T00:00:00+02:00`);
  const FESTIVAL_END = new Date(`${config.dates.endDate}T23:59:59+02:00`);

  const getTimeLeft = (): TimeLeft => {
    const now = Date.now();
    const diff = FESTIVAL_START.getTime() - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const totalSeconds = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [config.dates.startDate]);

  const isFestivalWeek = now >= FESTIVAL_START.getTime() && now < FESTIVAL_END.getTime();
  const isAfterFestival = now >= FESTIVAL_END.getTime();

  return (
    <div
      style={{
        background: config.theme.backgroundHex,
        border: `1px solid ${config.theme.accentHex}`,
        borderRadius: 0,
        padding: '2rem 2.5rem',
        textAlign: 'center',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <p
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.65rem',
          fontWeight: 900,
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}
      >
        DAYS UNTIL {config.appName.toUpperCase()}
      </p>

      {isAfterFestival ? (
        <p
          style={{
            color: config.theme.accentHex,
            fontSize: '1.6rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
          }}
        >
          SEE YOU AT {config.name.toUpperCase()} {config.dates.year + 1}
        </p>
      ) : isFestivalWeek ? (
        <p
          style={{
            color: config.theme.accentHex,
            fontSize: '1.6rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
            animation: 'countdown-pulse 1.5s ease-in-out infinite',
          }}
        >
          🔥 FESTIVAL IS LIVE — {config.location.city.toUpperCase()}
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}
        >
          {[
            { value: timeLeft.days, label: 'DAYS' },
            { value: timeLeft.hours, label: 'HRS' },
            { value: timeLeft.minutes, label: 'MIN' },
            { value: timeLeft.seconds, label: 'SEC' },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <span
                style={{
                  color: config.theme.accentHex,
                  fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  fontStyle: 'italic',
                  fontFamily: 'monospace',
                }}
              >
                {pad(value)}
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes countdown-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
