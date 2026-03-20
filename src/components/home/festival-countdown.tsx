'use client';

import { useEffect, useState } from 'react';

// Sziget 2026: August 5–11, 2026
// Target: Aug 5, 2026 00:00:00 Budapest time (UTC+2) = Aug 4, 2026 22:00:00 UTC
const FESTIVAL_START = new Date('2026-08-04T22:00:00Z');
// End of Aug 11, 2026 Budapest time = Aug 11, 2026 22:00:00 UTC
const FESTIVAL_END = new Date('2026-08-11T22:00:00Z');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
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
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function FestivalCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isFestivalWeek = now >= FESTIVAL_START.getTime() && now < FESTIVAL_END.getTime();
  const isAfterFestival = now >= FESTIVAL_END.getTime();

  return (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid #f5e642',
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
        DAYS UNTIL SZIGET 2026
      </p>

      {isAfterFestival ? (
        <p
          style={{
            color: '#f5e642',
            fontSize: '1.6rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
          }}
        >
          SEE YOU AT SZIGET 2027
        </p>
      ) : isFestivalWeek ? (
        <p
          style={{
            color: '#f5e642',
            fontSize: '1.6rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
            animation: 'countdown-pulse 1.5s ease-in-out infinite',
          }}
        >
          🔥 FESTIVAL IS LIVE — BUDAPEST
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
                  color: '#f5e642',
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
