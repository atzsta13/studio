'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Phrase {
  english: string;
  hungarian: string;
  pronunciation: string;
}

interface PhraseCategory {
  title: string;
  phrases: Phrase[];
}

const PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    title: 'GREETINGS',
    phrases: [
      { english: 'Hello', hungarian: 'Szia', pronunciation: 'see-ya' },
      { english: 'Good morning', hungarian: 'Jó reggelt', pronunciation: 'yo reg-gelt' },
      { english: 'Goodbye', hungarian: 'Viszlát', pronunciation: 'vis-laht' },
      { english: 'Thank you', hungarian: 'Köszönöm', pronunciation: 'kuh-suh-nuhm' },
      { english: 'Please', hungarian: 'Kérem', pronunciation: 'kay-rem' },
      { english: 'Sorry / Excuse me', hungarian: 'Elnézést', pronunciation: 'el-nay-zaysht' },
      { english: 'Yes / No', hungarian: 'Igen / Nem', pronunciation: 'ee-gen / nem' },
    ],
  },
  {
    title: 'AT THE FESTIVAL',
    phrases: [
      { english: 'Where is the stage?', hungarian: 'Hol van a színpad?', pronunciation: 'hole von a seen-pod' },
      { english: 'Where is the toilet?', hungarian: 'Hol van a WC?', pronunciation: 'hole von a vay-tsay' },
      { english: 'Water, please', hungarian: 'Vizet kérek', pronunciation: 'vi-zet kay-rek' },
      { english: 'How much does this cost?', hungarian: 'Mennyibe kerül?', pronunciation: 'men-yee-beh keh-rewl' },
      { english: "I'm lost", hungarian: 'Eltévedtem', pronunciation: 'el-tay-ved-tem' },
      { english: 'One beer please', hungarian: 'Egy sört kérek', pronunciation: 'edge shurt kay-rek' },
      { english: "I don't understand", hungarian: 'Nem értem', pronunciation: 'nem ayr-tem' },
    ],
  },
  {
    title: 'FOOD & DRINK',
    phrases: [
      { english: 'Vegetarian', hungarian: 'Vegetáriánus', pronunciation: 'veg-eh-tah-ree-ah-noosh' },
      { english: 'Without meat', hungarian: 'Hús nélkül', pronunciation: 'hoosh nayl-kewl' },
      { english: 'Water', hungarian: 'Víz', pronunciation: 'veez' },
      { english: 'Beer', hungarian: 'Sör', pronunciation: 'shur' },
      { english: 'Cheers!', hungarian: 'Egészségedre!', pronunciation: 'eg-ays-shay-ged-reh' },
    ],
  },
  {
    title: 'EMERGENCY',
    phrases: [
      { english: 'Help!', hungarian: 'Segítség!', pronunciation: 'sheg-eet-shayg' },
      { english: 'Call an ambulance', hungarian: 'Hívjon mentőt!', pronunciation: 'heev-yon men-tut' },
      { english: "I'm sick", hungarian: 'Rosszul vagyok', pronunciation: 'ross-ool vod-yok' },
      { english: 'Police', hungarian: 'Rendőrség', pronunciation: 'ren-dur-shayg' },
    ],
  },
];

function PhraseRow({ phrase }: { phrase: Phrase }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phrase.hungarian);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      // fallback silently
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem' }}>
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {phrase.english}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>→</span>
          <span
            style={{
              color: '#f5e642',
              fontWeight: 900,
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}
          >
            {phrase.hungarian}
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.75rem',
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            ({phrase.pronunciation})
          </span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        aria-label={`Copy ${phrase.hungarian}`}
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
          background: copied ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.05)',
          color: copied ? '#39ff14' : 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          fontSize: '0.65rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transition: 'all 0.15s ease',
        }}
      >
        {copied ? (
          <>
            <Check size={12} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={12} />
            COPY
          </>
        )}
      </button>
    </div>
  );
}

export function HungarianPhrases() {
  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      {PHRASE_CATEGORIES.map((cat) => (
        <div key={cat.title}>
          <p
            style={{
              color: '#f5e642',
              fontSize: '0.6rem',
              fontWeight: 900,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              padding: '1.25rem 1.5rem 0.5rem',
              margin: 0,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {cat.title}
          </p>
          <div>
            {cat.phrases.map((phrase) => (
              <PhraseRow key={`${phrase.hungarian}-${phrase.english}`} phrase={phrase} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
