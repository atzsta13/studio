# Web Implementation Guide

Step-by-step changes for every web file that needs updating in Phase 1. Each section shows the current code, what changes, and the replacement code.

---

## File Checklist

| Priority | File | Change |
|---|---|---|
| 🔴 Critical | `src/config/festival.ts` | **New file** — the config system (see `02_CONFIG_SYSTEM.md`) |
| 🔴 Critical | `src/types/index.ts` | Rename `szigetUrl` → `festivalUrl` |
| 🔴 Critical | `src/app/layout.tsx` | Import config, inject CSS vars, update metadata |
| 🔴 Critical | `src/app/api/weather/route.ts` | Replace hardcoded Budapest coords |
| 🔴 Critical | `src/components/home/festival-countdown.tsx` | Replace hardcoded dates |
| 🔴 Critical | `src/app/page.tsx` | Replace hardcoded `'Wednesday'` filter |
| 🔴 Critical | `src/lib/challenges.ts` | Replace hardcoded `FESTIVAL_DAYS` |
| 🔴 Critical | `src/ai/flows/recommend-artists-flow.ts` | Parameterize AI persona |
| 🟡 High | `src/components/layout/header.tsx` | Replace "Sziget Insider" text |
| 🟡 High | `src/components/tools/weather-widget.tsx` | Replace hardcoded location string |
| 🟡 High | `public/manifest.json` | Generated at build time |
| 🟡 High | `next.config.ts` | Pass FESTIVAL_ID through env |
| 🟢 Medium | Tools screen components | Feature flag gates |
| 🟢 Medium | `scripts/generate-manifest.mjs` | **New file** (see `03_DATA_PIPELINE.md`) |
| 🟢 Medium | `scripts/sync-data.mjs` | **New file** (see `03_DATA_PIPELINE.md`) |

---

## 1. `src/types/index.ts` — Rename `szigetUrl`

**Find and replace** in `LineupItem`:

```typescript
// BEFORE
szigetUrl?: string

// AFTER
festivalUrl?: string
```

Also update any reference to `item.szigetUrl` or `artist.szigetUrl` throughout the codebase (search with `grep -r "szigetUrl" src/`).

---

## 2. `src/app/layout.tsx` — Config + CSS vars

```tsx
// BEFORE (excerpt)
export const metadata: Metadata = {
  title: 'Sziget Insider 2026',
  description: 'Your unofficial offline-first guide to Sziget Festival 2026.',
}
```

```tsx
// AFTER (full file)
import type { Metadata, Viewport } from 'next'
import { FESTIVAL } from '@/config/festival'
import './globals.css'

export const metadata: Metadata = {
  title: FESTIVAL.appName,
  description: FESTIVAL.description,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: FESTIVAL.appName,
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: FESTIVAL.theme.primaryHex,
  colorScheme: 'dark',
}

// CSS custom properties injected from festival theme.
// This drives all Tailwind color utilities (text-primary, bg-accent, etc.)
const themeStyle = `
  :root {
    --primary: ${FESTIVAL.theme.primaryHsl};
    --primary-foreground: 0 0% 100%;
    --secondary: ${FESTIVAL.theme.secondaryHsl};
    --secondary-foreground: 0 0% 100%;
    --accent: ${FESTIVAL.theme.accentHsl};
    --accent-foreground: 0 0% 0%;
    --background: ${FESTIVAL.theme.backgroundHsl};
    --foreground: 0 0% 100%;
    --card: ${FESTIVAL.theme.cardHsl};
    --card-foreground: 0 0% 100%;
    --muted: 240 4% 16%;
    --muted-foreground: 0 0% 63%;
    --border: 240 4% 16%;
    --input: 240 4% 16%;
    --ring: ${FESTIVAL.theme.primaryHsl};
  }
  .text-glow {
    text-shadow: 0 0 20px ${FESTIVAL.theme.glowColor};
  }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

---

## 3. `src/app/api/weather/route.ts` — Coordinates from config

```typescript
// BEFORE
const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=47.5194&longitude=19.0512&timezone=Europe%2FBudapest&...`

// AFTER
import { FESTIVAL } from '@/config/festival'

const { lat, lng, timezone } = FESTIVAL.location
const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${lat}&longitude=${lng}` +
  `&timezone=${encodeURIComponent(timezone)}` +
  `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max` +
  `&current_weather=true` +
  `&forecast_days=7`
```

---

## 4. `src/components/home/festival-countdown.tsx` — Dates from config

```tsx
// BEFORE
const FESTIVAL_START = new Date('2026-08-04T22:00:00Z') // Aug 5 Budapest time
const FESTIVAL_END   = new Date('2026-08-11T22:00:00Z') // Aug 12 Budapest time

// ... later in JSX:
<span>DAYS UNTIL SZIGET 2026</span>
<span>🔥 FESTIVAL IS LIVE — BUDAPEST</span>
<span>SEE YOU AT SZIGET 2027</span>
```

```tsx
// AFTER
import { FESTIVAL } from '@/config/festival'

// Parse ISO dates and convert to UTC milliseconds for comparison
const FESTIVAL_START = new Date(FESTIVAL.dates.startDate + 'T00:00:00')
const FESTIVAL_END   = new Date(FESTIVAL.dates.endDate   + 'T23:59:59')

const nextYear = FESTIVAL.dates.year + 1
const festivalCity = FESTIVAL.location.city

// ... in JSX:
<span>DAYS UNTIL {FESTIVAL.name.toUpperCase()} {FESTIVAL.dates.year}</span>
<span>🔥 FESTIVAL IS LIVE — {festivalCity.toUpperCase()}</span>
<span>SEE YOU AT {FESTIVAL.name.toUpperCase()} {nextYear}</span>
```

---

## 5. `src/app/page.tsx` — Opening day filter

```typescript
// BEFORE (line ~72)
const headliners = (lineup as any[]).filter(a => a.day === 'Wednesday')

// AFTER
import { FESTIVAL } from '@/config/festival'

const headliners = (lineup as any[]).filter(
  a => a.day === FESTIVAL.dates.openingDayFilter
)
```

---

## 6. `src/lib/challenges.ts` — Festival days list

```typescript
// BEFORE
const FESTIVAL_DAYS = [
  'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'Sunday', 'Monday', 'Tuesday'
]

// AFTER
import { FESTIVAL } from '@/config/festival'

const FESTIVAL_DAYS = FESTIVAL.dates.days
```

The rest of the challenges file uses `FESTIVAL_DAYS` without change.

---

## 7. `src/ai/flows/recommend-artists-flow.ts` — AI persona

```typescript
// BEFORE
const systemPrompt = `You are the 'Sziget Insider Scout', a legendary festival veteran
who knows every corner of the Island of Freedom. Your job is to help festival-goers
discover artists at Sziget 2026...`

// AFTER
import { FESTIVAL } from '@/config/festival'

const systemPrompt = `You are ${FESTIVAL.aiPersona}. Your job is to help festival-goers
discover the perfect artists for them at ${FESTIVAL.fullName}.
The festival runs ${FESTIVAL.dates.startDate} to ${FESTIVAL.dates.endDate}
at ${FESTIVAL.location.venue}, ${FESTIVAL.location.city}.
Here is the complete ${FESTIVAL.dates.year} lineup as JSON context:
${JSON.stringify(lineup, null, 0)}`
```

---

## 8. `src/components/layout/header.tsx` — App name

```tsx
// BEFORE
<span className="font-bold text-lg">Sziget Insider</span>

// AFTER
import { FESTIVAL } from '@/config/festival'

<span className="font-bold text-lg">{FESTIVAL.appName}</span>
```

---

## 9. `src/components/tools/weather-widget.tsx` — Location display

```tsx
// BEFORE
<span className="text-muted-foreground">Budapest · Óbudai-sziget</span>

// AFTER
import { FESTIVAL } from '@/config/festival'

<span className="text-muted-foreground">{FESTIVAL.location.weatherDisplayName}</span>
```

---

## 10. Feature Flag Gates

Gate any tool that doesn't apply to all festivals. Wrap with the feature flag boolean from config:

```tsx
// src/components/tools/tools-grid.tsx (or wherever tools are listed)
import { FESTIVAL } from '@/config/festival'

export function ToolsGrid() {
  return (
    <div className="grid ...">

      {/* Always shown */}
      <WeatherCard />
      <TentFinderCard />

      {/* Only for festivals with local non-EUR currency */}
      {FESTIVAL.features.currencyConverter && <CurrencyConverterCard />}

      {/* Only for festivals with cashless RFID wristband */}
      {FESTIVAL.features.cashlessLink && FESTIVAL.features.cashlessUrl && (
        <CashlessWalletCard url={FESTIVAL.features.cashlessUrl} />
      )}

      {/* Frequency-specific: Daypark/Nightpark toggle (future feature) */}
      {FESTIVAL.features.dayparkNightparkMode && <DayparkNightparkToggle />}

    </div>
  )
}
```

The `CurrencyConverterCard` itself no longer needs to know the currency — it reads from config:

```tsx
// src/components/tools/currency-converter.tsx
import { FESTIVAL } from '@/config/festival'

const { localCode, localName, eurRate, usdRate, gbpRate } = FESTIVAL.currency

// Display: "HUF (Forint)" or "EUR (Euro)"
// Exchange rates: driven by config, not hardcoded
```

---

## 11. `next.config.ts` — Environment pass-through

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FESTIVAL_ID: process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'media.appmiral.com' },
      // Add per-festival CDN hostnames here as needed
    ],
  },
}

export default nextConfig
```

---

## 12. `.env.local` Examples

**.env.local for Sziget (default):**
```bash
NEXT_PUBLIC_FESTIVAL_ID=sziget-2026
NEXT_PUBLIC_FIREBASE_API_KEY=your-sziget-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sziget-insider-2026
SPOTIFY_CLIENT_ID=your-sziget-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-sziget-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:9002/api/auth/spotify/callback
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

**.env.local for Area 53:**
```bash
NEXT_PUBLIC_FESTIVAL_ID=area53-2026
NEXT_PUBLIC_FIREBASE_API_KEY=your-area53-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=area53-insider-2026
SPOTIFY_CLIENT_ID=your-area53-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-area53-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:9002/api/auth/spotify/callback
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

**.env.local for Nova Rock:**
```bash
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026
NEXT_PUBLIC_FIREBASE_PROJECT_ID=novarock-insider-2026
# ... same pattern
```

**.env.local for Frequency:**
```bash
NEXT_PUBLIC_FESTIVAL_ID=frequency-2026
NEXT_PUBLIC_FIREBASE_PROJECT_ID=frequency-insider-2026
# ... same pattern
```

---

## 13. Testing Each Festival Locally

```bash
# Test Sziget (default — no env var needed)
npm run dev

# Test Area 53 (Metal Red theme, 3-day Thu-Sat, no currency converter)
NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run dev

# Test Nova Rock (Orange theme, 4-day Thu-Sun, cashless link visible)
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run dev

# Test Frequency (Purple theme, Daypark/Nightpark flag, cashless link visible)
NEXT_PUBLIC_FESTIVAL_ID=frequency-2026 npm run dev
```

**Verification checklist per festival:**
- [ ] Header shows correct app name
- [ ] Primary color changes (header glow, buttons, accents)
- [ ] Countdown shows correct festival dates and city
- [ ] Weather widget location name is correct
- [ ] Tools screen: currency converter hidden for EUR festivals
- [ ] Tools screen: cashless link visible for Nova Rock + Frequency
- [ ] AI recommendation flow returns persona matching the festival
- [ ] Home screen filters correct opening day
- [ ] PWA manifest (`/manifest.json`) has correct name and theme color

---

## 14. Build Script Update

Add the data sync and manifest generation steps to the build pipeline:

```json
// package.json (build script)
{
  "scripts": {
    "prebuild": "node scripts/sync-data.mjs && node scripts/generate-manifest.mjs",
    "build": "next build"
  }
}
```

This ensures that whenever `npm run build` is called (including on Vercel), the correct festival data is in `src/data/` and `public/manifest.json` reflects the correct festival branding.
