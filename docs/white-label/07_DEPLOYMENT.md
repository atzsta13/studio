# Deployment Guide

How to deploy each festival as an independent web app (Vercel) and Android build (Play Store).

---

## Web Deployment — Strategy

Each festival is a **separate Vercel project** pointing at the same GitHub repository, differentiated only by environment variables. This gives:

- **Full isolation**: one festival's build can't break another
- **Custom domains**: `sziget.insiderapp.com`, `area53.insiderapp.com`, etc.
- **Independent deploys**: update Area 53 lineup without triggering a Sziget redeploy
- **Separate analytics and logs**: per-festival in Vercel dashboard

---

## Vercel Project Setup (per festival)

### Step 1: Create a new Vercel project

```bash
npx vercel link
# Select: Create new project
# Project name: festival-insider-<slug>
# Framework: Next.js
# Root directory: ./  (repo root)
```

Or via the Vercel dashboard: **New Project → Import Git Repository → Configure**.

### Step 2: Set environment variables

In **Project Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FESTIVAL_ID` | e.g. `area53-2026` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key for this festival's project |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `<project-id>.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | `https://<domain>/api/auth/spotify/callback` |
| `GOOGLE_GENAI_API_KEY` | Google Gemini API key |

### Step 3: Set custom domain

In **Project Settings → Domains**, add the custom domain:
- `sziget.insiderapp.com` (or client-supplied domain, e.g. `companion.szigetfestival.com`)
- `area53.insiderapp.com`
- `novarock.insiderapp.com`
- `frequency.insiderapp.com`

Vercel provisions SSL automatically.

---

## Per-Festival Vercel Project Reference

| Festival | Project Name | Domain | FESTIVAL_ID |
|---|---|---|---|
| Sziget 2026 | `festival-insider-sziget` | `sziget.insiderapp.com` | `sziget-2026` |
| Area 53 | `festival-insider-area53` | `area53.insiderapp.com` | `area53-2026` |
| Nova Rock | `festival-insider-novarock` | `novarock.insiderapp.com` | `novarock-2026` |
| Frequency | `festival-insider-frequency` | `frequency.insiderapp.com` | `frequency-2026` |

---

## GitHub Actions — CI/CD

### `.github/workflows/deploy.yml`

```yaml
name: Deploy Festival App

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      festival_id:
        description: 'Festival to deploy'
        required: true
        type: choice
        options:
          - sziget-2026
          - area53-2026
          - novarock-2026
          - frequency-2026

env:
  NODE_VERSION: '20'

jobs:
  # ── Type check + lint (runs once, festival-agnostic) ────────────────────
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint

  # ── Deploy specific festival ──────────────────────────────────────────────
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # On push to main: deploy all festivals.
        # On workflow_dispatch: deploy only the selected festival.
        festival: ${{ github.event_name == 'push' && fromJSON('["sziget-2026","area53-2026","novarock-2026","frequency-2026"]') || fromJSON(format('["{0}"]', github.event.inputs.festival_id)) }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci

      - name: Deploy ${{ matrix.festival }} to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets[format('VERCEL_PROJECT_ID_{0}', matrix.festival)] }}
          working-directory: ./
          vercel-args: '--prod'
        env:
          NEXT_PUBLIC_FESTIVAL_ID: ${{ matrix.festival }}
```

### Required GitHub Secrets

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel team/org ID |
| `VERCEL_PROJECT_ID_sziget-2026` | Vercel project ID for Sziget |
| `VERCEL_PROJECT_ID_area53-2026` | Vercel project ID for Area 53 |
| `VERCEL_PROJECT_ID_novarock-2026` | Vercel project ID for Nova Rock |
| `VERCEL_PROJECT_ID_frequency-2026` | Vercel project ID for Frequency |

---

## Spotify App Setup (per festival)

Each festival needs its own Spotify Developer App because:
1. The OAuth redirect URI must match the festival's domain
2. The playlist created in the user's library will be named after the festival (e.g., "My Area 53 2026 Picks")
3. Each festival's playlist activity is tracked separately in Spotify analytics

**Steps:**
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create App → name: "Area 53 Insider 2026"
3. Add Redirect URI: `https://area53.insiderapp.com/api/auth/spotify/callback`
4. Also add local dev URI: `http://localhost:9002/api/auth/spotify/callback`
5. Copy Client ID and Client Secret → add to Vercel env vars

---

## Firebase Setup (per festival)

### Option A: Separate Firebase project per festival (recommended for B2B)

Each festival organizer gets their own Firebase project → full data isolation.

1. Create Firebase project: `area53-insider-2026`
2. Enable Firestore, Authentication (Anonymous)
3. Add web app → copy config
4. Set Firestore security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /favorites/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Option B: Single Firebase project, festival-namespaced (simpler dev)

One Firebase project with festival-prefixed collection paths:

```typescript
// src/lib/firebase.ts
import { FESTIVAL } from '@/config/festival'

// Collection path: "favorites/sziget-2026/{userId}"
export const favoritesCollection = (userId: string) =>
  `favorites/${FESTIVAL.id}/${userId}`
```

---

## Android — Play Store Releases

### Signing Config

Each flavor can use a shared keystore or separate keystores. Shared keystore is simpler; separate keystores are needed if different organizations own each Play Store listing.

```kotlin
// android/app/build.gradle.kts
signingConfigs {
    create("release") {
        storeFile     = file(System.getenv("KEYSTORE_PATH") ?: "keystore.jks")
        storePassword = System.getenv("KEYSTORE_PASSWORD") ?: ""
        keyAlias      = System.getenv("KEY_ALIAS") ?: ""
        keyPassword   = System.getenv("KEY_PASSWORD") ?: ""
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
    }
}
```

### GitHub Actions — Android Release

```yaml
# .github/workflows/android-release.yml
name: Android Release

on:
  workflow_dispatch:
    inputs:
      flavor:
        description: 'Festival flavor to release'
        required: true
        type: choice
        options: [sziget, area53, novarock, frequency]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Decode keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/keystore.jks

      - name: Build release AAB
        run: |
          cd android
          ./gradlew bundle${{ inputs.flavor }}Release
        env:
          KEYSTORE_PATH: keystore.jks
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      - name: Upload AAB artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ inputs.flavor }}-release.aab
          path: android/app/build/outputs/bundle/${{ inputs.flavor }}Release/app-${{ inputs.flavor }}-release.aab
```

### Play Store Listing Per Flavor

Each flavor needs its own Play Store listing under the corresponding `applicationId`. The listing requires:

| Field | Sziget | Area 53 | Nova Rock | Frequency |
|---|---|---|---|---|
| App name | Sziget Insider 2026 | Area 53 Insider 2026 | Nova Rock Insider 2026 | Frequency Insider 2026 |
| Package ID | `com.yourcompany.szigetinsider` | `com.yourcompany.area53insider` | `com.yourcompany.novarockinsider` | `com.yourcompany.frequencyinsider` |
| Short description | Unofficial companion app for Sziget 2026 | Unofficial companion app for Area 53 2026 | Unofficial companion app for Nova Rock 2026 | Unofficial companion app for Frequency 2026 |
| Icon | Sziget-branded (magenta/black) | Area 53-branded (red/black) | Nova Rock-branded (orange/black) | Frequency-branded (purple/black) |
| Screenshots | Festival-specific UI | Festival-specific UI | Festival-specific UI | Festival-specific UI |

---

## Pre-Launch Checklist

Run this checklist for each new festival deployment before publishing.

**Configuration:**
- [ ] `NEXT_PUBLIC_FESTIVAL_ID` set correctly in Vercel
- [ ] Festival config object has correct dates, coordinates, currency, AI persona
- [ ] Feature flags correct (currency converter off for EUR festivals, etc.)

**Data:**
- [ ] `festivals/<slug>/data/lineup.json` exists and has at least 5 artists
- [ ] Vibes backfilled (`npm run lineup:vibes` ran)
- [ ] `poi.json` has at least main stage, medical, toilets
- [ ] `food.json` has at least 3 vendors
- [ ] `guide.json` has emergency section with correct country phone numbers

**Web:**
- [ ] `npm run build` succeeds with this `FESTIVAL_ID`
- [ ] PWA manifest: `name`, `short_name`, `theme_color` all correct
- [ ] Weather widget shows correct city
- [ ] Countdown shows correct dates
- [ ] AI recommendation returns festival-appropriate persona
- [ ] Spotify OAuth redirect URI registered in Spotify Developer Dashboard
- [ ] Custom domain configured in Vercel + SSL active

**Android:**
- [ ] `assembleDebug` for this flavor succeeds
- [ ] App name in launcher is correct
- [ ] Primary color matches festival branding
- [ ] Deep link scheme unique (no collision with other installed flavors)
- [ ] Currency converter hidden (for EUR festivals)
- [ ] Weather fetches from correct coordinates

**Firebase:**
- [ ] Firebase project created (or multi-festival project confirmed)
- [ ] Firestore rules deployed
- [ ] Web app config keys set in Vercel env vars
