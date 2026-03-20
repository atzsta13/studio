'use client';

import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'sziget-2026-camp-checklist';

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

const SECTIONS: ChecklistSection[] = [
  {
    title: 'CAMP BASE',
    items: [
      { id: 'tent-pitched', label: 'Tent pitched' },
      { id: 'sleeping-bag', label: 'Sleeping bag unpacked' },
      { id: 'sleeping-mat', label: 'Sleeping mat set up' },
      { id: 'tarp', label: 'Tarp secured (if raining)' },
    ],
  },
  {
    title: 'ESSENTIALS',
    items: [
      { id: 'wristband', label: 'Festival wristband on wrist' },
      { id: 'phone-charged', label: 'Phone fully charged' },
      { id: 'power-bank', label: 'Power bank packed' },
      { id: 'cash-card', label: 'Cash/card in pocket' },
      { id: 'emergency-contact', label: 'Emergency contact saved in phone' },
    ],
  },
  {
    title: 'FESTIVAL KIT',
    items: [
      { id: 'water-bottle', label: 'Water bottle packed' },
      { id: 'earplugs', label: 'Earplugs packed' },
      { id: 'sunscreen', label: 'Sunscreen packed' },
      { id: 'rain-jacket', label: 'Rain jacket accessible' },
      { id: 'comfortable-shoes', label: 'Comfortable shoes on' },
    ],
  },
  {
    title: 'FRIENDS & SAFETY',
    items: [
      { id: 'meetup-point', label: 'Meet-up point agreed with group' },
      { id: 'campsite-location', label: 'Someone knows your campsite location' },
      { id: 'first-aid', label: 'First aid basics packed' },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.items.map((i) => i.id));
const TOTAL = ALL_IDS.length;

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, boolean>;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

export function CampsiteChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setChecked(loadChecked());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, loaded]);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reset = () => {
    if (confirm('Reset campsite checklist?')) {
      setChecked({});
    }
  };

  const readyCount = ALL_IDS.filter((id) => checked[id]).length;
  const progressPct = TOTAL > 0 ? Math.round((readyCount / TOTAL) * 100) : 0;
  const allDone = readyCount === TOTAL;

  if (!loaded) return null;

  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Progress header */}
      <div
        style={{
          padding: '1.5rem 1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {allDone ? (
          <p
            style={{
              color: '#39ff14',
              fontSize: '1.3rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              fontStyle: 'italic',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              textShadow: '0 0 20px rgba(57,255,20,0.4)',
            }}
          >
            ✓ CAMP BASE SECURED
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.6rem',
            }}
          >
            <span
              style={{
                color: '#f5e642',
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                fontStyle: 'italic',
              }}
            >
              {readyCount} / {TOTAL} READY
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.7rem',
                fontWeight: 900,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              {progressPct}%
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div
          style={{
            height: '6px',
            background: 'rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: allDone ? '#39ff14' : '#f5e642',
              width: `${progressPct}%`,
              transition: 'width 0.3s ease',
              boxShadow: progressPct > 0
                ? allDone
                  ? '0 0 12px rgba(57,255,20,0.5)'
                  : '0 0 12px rgba(245,230,66,0.5)'
                : 'none',
            }}
          />
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} style={{ padding: '1.25rem 1.5rem 0.5rem' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.6rem',
              fontWeight: 900,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}
          >
            {section.title}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              marginBottom: '0.75rem',
            }}
          >
            {section.items.map((item) => {
              const isChecked = !!checked[item.id];
              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.75rem',
                    background: isChecked ? 'rgba(245,230,66,0.04)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    userSelect: 'none',
                  }}
                >
                  {/* Custom checkbox */}
                  <div
                    onClick={() => toggle(item.id)}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: isChecked ? '2px solid #f5e642' : '2px solid rgba(255,255,255,0.2)',
                      background: isChecked ? '#f5e642' : 'transparent',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isChecked ? '0 0 8px rgba(245,230,66,0.35)' : 'none',
                    }}
                  >
                    {isChecked && (
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path
                          d="M1 3.5L4.5 7L10 1"
                          stroke="#0a0a0a"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(item.id)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    aria-label={item.label}
                  />

                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: isChecked ? 600 : 700,
                      color: isChecked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(245,230,66,0.4)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Reset button */}
      <div
        style={{
          padding: '1rem 1.5rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: '0.5rem',
        }}
      >
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            border: '1px solid rgba(255,80,80,0.2)',
            background: 'rgba(255,80,80,0.05)',
            color: 'rgba(255,80,80,0.6)',
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontWeight: 900,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.12)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,80,80,0.9)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.05)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,80,80,0.6)';
          }}
        >
          <RotateCcw size={13} />
          RESET
        </button>
      </div>
    </div>
  );
}
