# 🚀 Deployment & Production Guide

This document outlines the steps required to take Sziget Insider 2026 from a development prototype to a live app for Szitizens.

## 1. Hosting Requirements
The app is built on **Next.js 16** and requires a Node.js 20+ environment.
- **Recommended**: Firebase App Hosting or Vercel.
- **Protocol**: Must be served over **HTTPS** for the PWA Service Worker and Geolocation (Tent Finder) to function.

## 2. Environment Variables
You must set the following keys in your hosting provider's dashboard:

| Variable | Description |
|----------|-------------|
| `GOOGLE_GENAI_API_KEY` | Required for Genkit (AI Scout). Obtain from Google AI Studio. |
| `SPOTIFY_CLIENT_ID` | Required for Spotify Match Engine. |
| `SPOTIFY_CLIENT_SECRET` | Required for Spotify Match Engine. |
| `NEXT_PUBLIC_BASE_URL` | Your production URL (e.g., `https://sziget-insider.app`). |

## 3. Spotify Configuration
To use the Spotify Match Engine in production:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add your production URL + `/api/auth/spotify/callback` to the **Redirect URIs** list.
3. Update `src/lib/spotify.ts` or use environment variables to point to the production URI.

## 4. PWA Assets
The app is PWA-ready but requires physical icons in `public/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`
- `maskable-icon.png`

## 5. Build Command
```bash
npm run build
```
This will trigger the Next.js build process, generating static pages for all 80+ artists for sub-second performance.

## 6. Offline Support
The app uses a Service Worker (`public/sw.js`) to cache static assets and JSON data. Ensure this file is updated if you add large new media assets.
