# API Endpoints Reference

**Last updated:** 2026-03-20
**Scope:** Web backend routes (`src/app/api/`)
**Framework:** Next.js 16 App Router

---

## TLDR

- **6 endpoint groups:** Spotify Auth, Spotify Library, Weather, AI recommendations, others
- **Response format:** JSON (or 302 redirect for OAuth)
- **Error handling:** 400/401/500 with `{ error: "message" }`
- **Caching:** Weather (30 min), recommendations (5 min), everything else (none)

---

## Table of Contents

1. [Spotify Authentication](#spotify-authentication)
2. [Spotify Library Matching](#spotify-library-matching)
3. [Spotify Playlist Builder](#spotify-playlist-builder)
4. [Weather Proxy](#weather-proxy)
5. [AI Recommendations](#ai-recommendations)
6. [Error Responses](#error-responses)

---

## Spotify Authentication

### `GET /api/auth/spotify/`

**Purpose:** Initiate Spotify OAuth flow
**Location:** `src/app/api/auth/spotify/route.ts`

**Request:**
```
GET /api/auth/spotify/?redirect_to=/discover
```

**Query Parameters:**
| Name | Type | Required | Notes |
|------|------|----------|-------|
| `redirect_to` | string | No | Where to send user after OAuth callback (default: `/discover`) |

**Response:**
```
302 Found
Location: https://accounts.spotify.com/authorize?
  client_id=d27e168c2c3746f7a22c075ce1a49dc2
  &response_type=code
  &redirect_uri=http://localhost:9002/api/auth/spotify/callback
  &scope=user-library-read+playlist-modify-private+playlist-modify-public
  &state=xyz123
```

**Cookies Set:**
```
Set-Cookie: spotify_oauth_state=xyz123; HttpOnly; Secure; Max-Age=600
```

**Error Responses:**
```
500 Internal Server Error
{ "error": "Failed to generate OAuth state" }
```

**Notes:**
- Redirects to Spotify login page
- State parameter prevents CSRF attacks
- State expires after 10 minutes

---

### `GET /api/auth/spotify/callback`

**Purpose:** Handle Spotify OAuth redirect
**Location:** `src/app/api/auth/spotify/callback/route.ts`

**Request:**
```
GET /api/auth/spotify/callback?code=abc123xyz&state=xyz123
```

**Query Parameters:**
| Name | Type | Required | Notes |
|------|------|----------|-------|
| `code` | string | Yes | Authorization code from Spotify |
| `state` | string | Yes | Must match stored state (CSRF prevention) |
| `error` | string | No | If present, user denied permissions |

**Response (Success):**
```
302 Found
Location: /discover?spotify=connected

Set-Cookie: spotify_token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; Max-Age=3600; Path=/
Set-Cookie: spotify_refresh=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; Max-Age=2592000; Path=/
```

**Response (User Denied):**
```
302 Found
Location: /discover?spotify=denied
```

**Response (State Mismatch):**
```
400 Bad Request
{ "error": "Invalid state parameter (CSRF attack suspected)" }
```

**Response (Code Exchange Failed):**
```
400 Bad Request
{ "error": "invalid_grant: The authorization code is expired." }
```

**Notes:**
- Tokens are httpOnly (not accessible to JavaScript)
- Access token: 1 hour lifetime
- Refresh token: non-expiring (or ~30 days depending on Spotify)
- State cookie cleared after use

---

## Spotify Library Matching

### `GET /api/spotify/matches`

**Purpose:** Return list of user's saved track artist IDs that match lineup
**Location:** `src/app/api/spotify/matches/route.ts`
**Authentication:** Requires valid `spotify_token` cookie

**Request:**
```
GET /api/spotify/matches
Cookie: spotify_token=eyJhbGciOiJIUzI1NiIs...
```

**Query Parameters:** None

**Response (Success):**
```json
{
  "matchedArtistIds": [
    "0I2XqVXqHScXjSH0JDtIqf",  // KAYTRANADA
    "74KM79TiuVKeVoxml4QY1e",  // Taylor Swift
    "1vCWHaC5f2uS3yhpwWbIA6"   // Imagine Dragons
  ],
  "totalSavedTracks": 487,
  "matchedCount": 3
}
```

**Response (No Token):**
```
401 Unauthorized
{ "error": "No Spotify token found. User must authenticate first." }
```

**Response (Token Expired, Refresh Failed):**
```
401 Unauthorized
{ "error": "Spotify token expired and cannot be refreshed. User must re-authenticate." }
```

**Response (Spotify API Error):**
```
502 Bad Gateway
{ "error": "Spotify API error: 429 Too Many Requests" }
```

**Cache:**
- **Duration:** No cache (fresh matches every request)
- **Rationale:** User library changes frequently during festival

**Pagination:**
- Internally paginated: fetches up to 10,000 saved tracks (200 per request × 50 requests)
- User sees all matches regardless

**Performance:**
- ~500-2000ms depending on library size
- Consider caching result for 5 minutes if performance is critical

**Notes:**
- Uses `GET /v1/me/tracks` Spotify API (user-library-read scope)
- Requires valid access token (auto-refreshes if expired)
- Intersection: returns only artists present in both Spotify library AND lineup.json

---

## Spotify Playlist Builder

### `POST /api/spotify/build-playlist`

**Purpose:** Create a Spotify playlist from matched artist IDs
**Location:** `src/app/api/spotify/build-playlist/route.ts`
**Authentication:** Requires valid `spotify_token` cookie

**Request:**
```json
POST /api/spotify/build-playlist
Content-Type: application/json
Cookie: spotify_token=eyJhbGciOiJIUzI1NiIs...

{
  "playlistName": "Sziget Insider 2026",
  "artistIds": [
    "0I2XqVXqHScXjSH0JDtIqf",
    "74KM79TiuVKeVoxml4QY1e"
  ],
  "isPublic": false,
  "isCollaborative": false
}
```

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `playlistName` | string | No | Playlist title (default: "Sziget Insider 2026") |
| `artistIds` | string[] | Yes | Spotify artist IDs to add |
| `isPublic` | boolean | No | Allow others to see (default: false) |
| `isCollaborative` | boolean | No | Allow others to edit (default: false) |

**Response (Success):**
```json
{
  "playlistId": "37i9dQZF1Dz4V6YxQbJuWX",
  "playlistUrl": "https://open.spotify.com/playlist/37i9dQZF1Dz4V6YxQbJuWX",
  "tracksAdded": 6,
  "tracksSkipped": 0
}
```

**Response (No Token):**
```
401 Unauthorized
{ "error": "No Spotify token found. User must authenticate first." }
```

**Response (Invalid Artist ID):**
```
400 Bad Request
{ "error": "Artist ID '0I2XqVXqHScXjSH0JDtIqf' not found on Spotify" }
```

**Response (Playlist Limit):**
```
400 Bad Request
{ "error": "User has reached maximum playlist limit (100 playlists). Delete some to create new ones." }
```

**Response (Empty Artist List):**
```
400 Bad Request
{ "error": "artistIds array cannot be empty" }
```

**Process:**
1. Create private playlist (or public if requested)
2. For each artist:
   - Fetch top 3 tracks (popularity-sorted)
   - Add to playlist
3. Return playlist URL

**Notes:**
- Creates playlists in user's personal library
- Max 50 tracks per API call; handles >50 artists via batching
- Uses `playlist-modify-private` scope
- Tracks added: 3 per artist (if available)
- Skipped artists: counted but not added to result

---

## Weather Proxy

### `GET /api/weather`

**Purpose:** Budapest 7-day weather forecast (Open-Meteo API)
**Location:** `src/app/api/weather/route.ts`
**Authentication:** None

**Request:**
```
GET /api/weather
```

**Query Parameters:** None

**Response (Success):**
```json
{
  "daily": [
    {
      "date": "2026-03-20",
      "maxTemp": 18.5,
      "minTemp": 12.3,
      "precipProbability": 45,
      "weatherCode": 45
    },
    {
      "date": "2026-03-21",
      "maxTemp": 19.2,
      "minTemp": 13.1,
      "precipProbability": 60,
      "weatherCode": 80
    }
  ],
  "rainAlert": true
}
```

**Response Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `date` | string | YYYY-MM-DD format |
| `maxTemp` | number | Celsius |
| `minTemp` | number | Celsius |
| `precipProbability` | number | 0–100 (%) |
| `weatherCode` | number | WMO code (see table below) |
| `rainAlert` | boolean | True if any hour in next 24h has >60% precipitation |

**Weather Codes (WMO):**
| Code | Condition |
|------|-----------|
| 0 | Clear sky |
| 1–3 | Partly cloudy |
| 45–48 | Foggy |
| 51–67 | Drizzle/rain |
| 80–82 | Rain showers |
| 85–86 | Snow showers |

**Cache:**
- **Duration:** 30 minutes (in-memory)
- **Key:** `weather:budapest:${date}`
- **Invalidation:** Automatic after 30min; also cleared on manual refresh

**Response (Network Error):**
```
503 Service Unavailable
{ "error": "Failed to fetch weather data from Open-Meteo" }
```

**Notes:**
- Uses Open-Meteo API (free, no auth required)
- Location: Budapest (47.5°N, 19.05°E)
- 7-day forecast (current day + 6 days)
- No caching on client (fetches fresh on each page load, but 30-min server cache hits)

---

## AI Recommendations

### `POST /api/ai/recommend`

**Purpose:** AI-powered artist recommendations based on mood prompt
**Location:** `src/app/api/ai/recommend/route.ts` (if implemented)
**Authentication:** None (but counts against API quota)

**Request:**
```json
POST /api/ai/recommend
Content-Type: application/json

{
  "prompt": "I like electronic music with heavy bass and energetic vibes",
  "topK": 5
}
```

**Request Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `prompt` | string | Yes | Mood/preference description (max 500 chars) |
| `topK` | number | No | Number of recommendations (default: 5, max: 10) |

**Response (Success):**
```json
{
  "artistIds": [
    "0I2XqVXqHScXjSH0JDtIqf",
    "74KM79TiuVKeVoxml4QY1e",
    "1vCWHaC5f2uS3yhpwWbIA6"
  ],
  "matchReasons": [
    "Heavy electronic production with bass-heavy arrangement",
    "Known for high-energy festival performances",
    "Combines electronic and hip-hop with dynamic live shows"
  ],
  "model": "gemini-2.5-flash",
  "tokensUsed": {
    "input": 1234,
    "output": 456
  }
}
```

**Response (No API Key):**
```
500 Internal Server Error
{ "error": "GOOGLE_GENAI_API_KEY not configured" }
```

**Response (Invalid Prompt):**
```
400 Bad Request
{ "error": "Prompt must be between 10 and 500 characters" }
```

**Response (API Rate Limit):**
```
429 Too Many Requests
{ "error": "Google AI API rate limit exceeded. Try again in 1 minute." }
```

**Cache:**
- **Duration:** 5 minutes
- **Key:** `ai:recommendations:${hashPrompt}`
- **Rationale:** Same prompt → same results; festival context doesn't change hourly

**Notes:**
- Uses `gemini-2.5-flash` (fast + cheap)
- Injects full `lineup.json` as context
- Returns up to `topK` artists (may return fewer if not enough confident matches)
- Cost: ~0.001 USD per request (input tokens cheap, output tokens cheaper)

---

## Error Responses

### Standard Error Format

All errors return JSON with this structure:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-20T15:30:45Z",
  "requestId": "uuid-for-logging"
}
```

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Bad Request | Missing required field, invalid format |
| 401 | Unauthorized | Invalid/missing auth token |
| 403 | Forbidden | User doesn't have permission (not used currently) |
| 429 | Too Many Requests | Rate limit exceeded (Spotify, Google AI) |
| 500 | Internal Server Error | Server bug or unexpected failure |
| 502 | Bad Gateway | Upstream API error (Spotify, Open-Meteo, Google) |
| 503 | Service Unavailable | Upstream service down |

### Common Error Codes

| Code | HTTP | Cause | Solution |
|------|------|-------|----------|
| `NO_TOKEN` | 401 | User not authenticated | Redirect to Spotify login |
| `TOKEN_EXPIRED` | 401 | Refresh failed | Redirect to Spotify login |
| `SPOTIFY_ERROR` | 502 | Spotify API error | Retry or show friendly message |
| `INVALID_STATE` | 400 | CSRF attack suspected | Refresh page, clear cookies |
| `RATE_LIMIT` | 429 | Too many requests | Implement exponential backoff |
| `MISSING_FIELD` | 400 | Required field missing | Validate on client before sending |

---

## Rate Limiting & Quotas

| Service | Limit | Unit | Notes |
|---------|-------|------|-------|
| Spotify | 429 (rate limit) | Per request | Retries with backoff handle this |
| Google AI | 15 requests | Per minute | Low limit; cache aggressively |
| Open-Meteo | Unlimited | — | Free tier, no auth required |
| Our server | — | — | No built-in limit (should add) |

---

## Testing Endpoints

### Using cURL

```bash
# Get weather
curl https://sziget-studio.vercel.app/api/weather

# Start Spotify auth (redirects)
curl -L https://sziget-studio.vercel.app/api/auth/spotify/?redirect_to=/discover

# Build playlist (requires token cookie)
curl -X POST https://sziget-studio.vercel.app/api/spotify/build-playlist \
  -H "Content-Type: application/json" \
  -b "spotify_token=YOUR_TOKEN" \
  -d '{
    "artistIds": ["0I2XqVXqHScXjSH0JDtIqf"],
    "playlistName": "Test"
  }'

# Get matches (requires token cookie)
curl https://sziget-studio.vercel.app/api/spotify/matches \
  -b "spotify_token=YOUR_TOKEN"
```

### Using Postman

1. **Import:** `GET /api/weather`
2. **Set auth:** None
3. **Send:** Blue button
4. **View:** Response tab

For authenticated endpoints:
1. First complete Spotify OAuth flow in browser
2. Copy token from DevTools → Application → Cookies → `spotify_token`
3. In Postman: Auth tab → Cookie → Add cookie

---

## Related Files

- `src/app/api/` — All endpoint implementations
- `src/lib/spotify.ts` — Spotify helpers used by endpoints
- `src/ai/flows/` — AI recommendation flow
- `.env.local` — Required API keys
- `docs/SPOTIFY_INTEGRATION.md` — Detailed Spotify flow guide
