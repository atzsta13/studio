# Spotify Integration Guide

**Last updated:** 2026-03-20
**Status:** ✅ Implemented on Web + Android
**Priority:** Critical (PKCE, token management, error handling)

---

## TLDR

- **Web:** OAuth 2.0 with client secret, httpOnly cookies, refresh tokens optional
- **Android:** OAuth 2.0 + PKCE (no client secret), SharedPreferences, token refresh required
- **Shared:** Client ID `d27e168c2c3746f7a22c075ce1a49dc2`, user-library-read scope
- **Key difference:** Android must refresh tokens; Web tokens have longer lifetime

---

## Table of Contents

1. [Architecture](#architecture)
2. [Web OAuth Flow](#web-oauth-flow)
3. [Android OAuth Flow](#android-oauth-flow)
4. [PKCE (RFC 7636)](#pkce-rfc-7636)
5. [Token Management](#token-management)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Architecture

### Endpoints

| Platform | Endpoint | Purpose |
|----------|----------|---------|
| **Web** | `/api/auth/spotify/` | Initiates OAuth, redirects to Spotify |
| **Web** | `/api/auth/spotify/callback` | Receives auth code, exchanges for tokens |
| **Web** | `/api/spotify/matches` | GET — returns array of matched artist IDs |
| **Web** | `/api/spotify/build-playlist` | POST — creates Spotify playlist from artist IDs |
| **Android** | `sziget://spotify-callback` | Deep link receives auth code |
| **Android** | SpotifyRepository | Handles token exchange + library scanning |

### Token Storage

| Platform | Where | Encrypted? | Expiration |
|----------|-------|-----------|-----------|
| **Web** | httpOnly cookie | Yes (via HTTPS) | Server-determined |
| **Android** | SharedPreferences | No (MVP) | `expiresAt` timestamp |

**Note:** Android SharedPreferences is not encrypted. For production, use Android Keystore.

---

## Web OAuth Flow

### 1. User clicks "Connect Spotify"

```
src/components/spotify/spotify-connect.tsx
  → calls getAuthUrl() from src/lib/spotify.ts
  → redirects window.location to:
    https://accounts.spotify.com/authorize?
      client_id={SPOTIFY_CLIENT_ID}
      &response_type=code
      &redirect_uri=http://127.0.0.1:9002/api/auth/spotify/callback
      &scope=user-library-read+playlist-modify-private+playlist-modify-public
      &show_dialog=true
```

### 2. User logs in to Spotify

Spotify displays login + permission request.

### 3. Spotify redirects back with auth code

```
GET /api/auth/spotify/callback?code=abc123&state=xyz
```

**Handler:** `src/app/api/auth/spotify/callback/route.ts`

### 4. Backend exchanges code for tokens

```typescript
// src/app/api/auth/spotify/callback/route.ts
const response = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET  // ← Web only! Never share with client
  })
});

const tokens = await response.json();
// { access_token, refresh_token, expires_in, ... }
```

### 5. Tokens stored in httpOnly cookie

```typescript
// Set-Cookie: spotify_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
// Set-Cookie: spotify_refresh=...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

Browser can't access via JavaScript (XSS safe). Automatically sent with every request to `/api/spotify/*`.

### 6. User sees "X Spotify Matches"

- Component calls `/api/spotify/matches` (GET)
- Backend loads `src/data/lineup.json`, scans user's Spotify library, returns matched artist IDs
- Frontend displays chip with count

---

## Android OAuth Flow

### 1. User taps "SYNC SPOTIFY LIBRARY"

**File:** `ui/discover/DiscoverScreen.kt`

```kotlin
val (authUrl, codeVerifier) = spotifyViewModel.startAuth()
spotifyCodeVerifier = verifier
context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(authUrl)))
```


**File:** `data/repository/SpotifyRepository.kt`

```kotlin
fun generateCodeVerifier(): String {
  // 128-char random string: [A-Za-z0-9\-._~]
  val charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  return (1..128).map { charPool[random.nextInt(charPool.length)] }.joinToString("")
}

  // SHA-256(verifier) → Base64-URL-encode → strip padding
  val digest = MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray())
  return Base64.encodeToString(digest, Base64.URL_SAFE or Base64.NO_PADDING)
}
```

**Why PKCE?** Authorization code interception risk: if malicious app captures code during redirect, it can't use it without the verifier (only the original app knows it).


```
https://accounts.spotify.com/authorize?
  client_id=d27e168c2c3746f7a22c075ce1a49dc2
  &response_type=code
  &redirect_uri=sziget://spotify-callback
  &scope=user-library-read
  &show_dialog=true
```

### 4. Browser opens, user logs in

Spotify redirects: `sziget://spotify-callback?code=abc123&state=...`

### 5. Deep link intercepted

**File:** `AndroidManifest.xml`
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="sziget" android:host="spotify-callback" />
</intent-filter>
```

**File:** `MainActivity.kt`
```kotlin
override fun onNewIntent(intent: Intent) {
  val uri = intent.data
  if (uri?.scheme == "sziget" && uri.host == "spotify-callback") {
    val code = uri.getQueryParameter("code")
    val prefs = getSharedPreferences("spotify_callback", MODE_PRIVATE)
    prefs.edit().putString("pending_code", code).apply()
  }
}
```

### 6. DiscoverScreen detects code, exchanges it

**File:** `ui/discover/DiscoverScreen.kt`

```kotlin
LaunchedEffect(spotifyAuthState) {
  if (spotifyAuthState is SpotifyAuthState.Connected && spotifyCodeVerifier != null) {
    val prefs = context.getSharedPreferences("spotify_callback", Context.MODE_PRIVATE)
    val code = prefs.getString("pending_code", null)
    if (code != null) {
      spotifyViewModel.handleCallback(code, spotifyCodeVerifier!!, allArtists)
      prefs.edit().remove("pending_code").apply()
    }
  }
}
```

### 7. SpotifyViewModel exchanges code for tokens

**File:** `data/repository/SpotifyRepository.kt`

```kotlin
suspend fun exchangeCode(code: String, codeVerifier: String): SpotifyTokens? {
  val body = mapOf(
    "grant_type" to "authorization_code",
    "code" to code,
    "redirect_uri" to "sziget://spotify-callback",
    "client_id" to "d27e168c2c3746f7a22c075ce1a49dc2",
    "code_verifier" to codeVerifier  // ← Proves we own the code
  )

  val response = URL("https://accounts.spotify.com/api/token").openConnection().apply {
    setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
    doOutput = true
    outputStream.write(queryString.toByteArray())
  }

  val tokens = json.decodeFromString<SpotifyTokens>(response.inputStream.bufferedReader().readText())
  saveTokens(tokens)  // SharedPreferences
  return tokens
}
```

### 8. SpotifyViewModel scans user's saved tracks

```kotlin
suspend fun getMatchedArtistIds(lineup: List<Artist>): Set<String> {
  var allSpotifyIds = mutableSetOf<String>()
  var nextUrl = "$API_URL/me/tracks?limit=50"

  while (nextUrl != null) {
    val response = URL(nextUrl).openConnection().apply {
      setRequestProperty("Authorization", "Bearer $accessToken")
    }.inputStream.bufferedReader().readText()

    val trackPage = json.decodeFromString<SpotifyTrackPage>(response)
    trackPage.items.forEach { item ->
      item.track.artists.forEach { artist ->
        allSpotifyIds.add(artist.id)
      }
    }
    nextUrl = trackPage.next
  }

  // Cross-reference with lineup
  val lineupSpotifyIds = lineup.mapNotNull { it.spotifyId }.toSet()
  return allSpotifyIds.intersect(lineupSpotifyIds)
}
```

### 9. UI updates with matched count

```kotlin
// SpotifyMatchedIds flows to DiscoverScreen
// Shows: "42 MATCHES" chip + "SHOW ONLY" toggle
// Filter state applied to artist grid
```

---

## PKCE (RFC 7636)

### Why it matters

**Traditional OAuth 2.0 vulnerability on mobile:**

2. **Intercept:** Malicious app captures redirect with `code=xyz`
3. **Replay:** Malicious app exchanges code without verifier: `POST /token?code=xyz`
4. **Result:** Attacker gains access token!

**PKCE fix:**

1. App generates `code_verifier` (128 random chars)
4. Intercept: Attacker captures `code=xyz`
5. Replay: Attacker tries `POST /token?code=xyz&code_verifier=???`
7. **Result:** Attacker can't use stolen code!

### Implementation in Android

```kotlin
// Generate once per auth attempt
val verifier = generateCodeVerifier()  // 128 random chars

// Include in auth URL

// Store verifier until code arrives
spotifyCodeVerifier = verifier

// Use when exchanging code
exchangeCode(code, spotifyCodeVerifier)  // POST includes code_verifier
```

---

## Token Management

### Web Token Lifecycle

```
1. User clicks "Connect Spotify"
   ↓
2. GET /api/auth/spotify/callback?code=abc
   ↓
3. Server exchanges code for tokens (via client_secret)
   ↓
4. Server stores tokens in httpOnly cookies (automatic)
   ↓
5. Client makes request to /api/spotify/matches
   → Browser auto-attaches spotify_token cookie
   ↓
6. Server uses token to call Spotify API
   ↓
7. If token expired: server uses refresh_token to get new one
   ↓
8. New tokens stored in cookies (automatic rotation)
```

**Key:** Server handles all token logic. Client never touches tokens.

### Android Token Lifecycle

```
1. User taps "SYNC SPOTIFY LIBRARY"
   ↓
   ↓
3. Browser opens Spotify login
   ↓
4. User authorizes → deep link with code
   ↓
5. MainActivity saves code to SharedPreferences
   ↓
6. DiscoverScreen detects code, calls SpotifyViewModel.handleCallback()
   ↓
7. SpotifyViewModel.exchangeCode(code, verifier)
   ↓
8. SpotifyRepository saves tokens to SharedPreferences
   ↓
9. getMatchedArtistIds() uses access token
   ↓
10. If token expired: getValidAccessToken() calls refreshAccessToken()
    → Spotify returns new token
    → tokens re-saved
```

### Token Expiration & Refresh

#### Web (automatic)

```typescript
// src/app/api/spotify/matches/route.ts
const token = cookies().get('spotify_token')?.value;

if (isExpired(token)) {
  const newToken = await refreshAccessToken(cookies().get('spotify_refresh')?.value);
  // Update cookies
}

// Call Spotify API with fresh token
```

#### Android (manual)

```kotlin
// SpotifyRepository.kt
private suspend fun getValidAccessToken(): String? {
  val token = prefs.getString(KEY_ACCESS_TOKEN, null)

  return when {
    token == null -> null
    System.currentTimeMillis() < expiresAt -> token
    else -> {  // Expired, try refresh
      val refreshToken = prefs.getString(KEY_REFRESH_TOKEN, null)
      if (refreshToken != null) refreshAccessToken(refreshToken) else null
    }
  }
}
```

---

## Error Handling

### Web

| Error | Source | Handling |
|-------|--------|----------|
| `invalid_client` | Spotify | SPOTIFY_CLIENT_SECRET missing/wrong |
| `invalid_grant` | Spotify | Code expired or already used |
| `access_denied` | Spotify | User declined permission |
| Network error | Our server | Return 503, retry client-side |

**UX:** Error page with "Try again" button

### Android

| Error | Source | Handling |
|-------|--------|----------|
| User closes browser | OS | No code arrives, UI stays in "Idle" state |
| Deep link not registered | Android | Intent doesn't fire, code never reaches app |
| Token refresh fails | Spotify | `getValidAccessToken()` returns null, show error |
| Network timeout | Android | Exception caught, error state set |

**UX:** Toast + error message in `authState.Error`

---

## Testing

### Web

```bash
# 1. Set env vars in .env.local
SPOTIFY_CLIENT_ID=d27e168c2c3746f7a22c075ce1a49dc2
SPOTIFY_CLIENT_SECRET=<your-secret>
NEXT_PUBLIC_BASE_URL=http://localhost:9002

# 2. Start dev server
npm run dev

# 3. Navigate to /discover
# 4. Click "SYNC SPOTIFY LIBRARY"
# 5. Log in with Spotify test account
# 6. Grant permission
# 7. Should redirect back with matches
```

### Android

```bash
# 1. Build debug APK
./gradlew assembleDebug

# 2. Install on emulator/device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 3. Open app, go to Discover
# 4. Tap "SYNC SPOTIFY LIBRARY"
# 5. Browser opens
# 6. Log in
# 7. App should receive code via deep link

# Test token refresh:
# - Note access token in logcat
# - Wait 1 hour (or mock time)
# - Tap "SYNC SPOTIFY LIBRARY" again
# - Should use refresh token silently
```

### Edge Cases to Test

- **Deny permission:** User clicks "No" on Spotify screen → error state
- **Expired token:** Manually delete SharedPreferences entry → should show error
- **Network down:** Disable WiFi → app should show error gracefully
- **Revoked app:** User removes Sziget app from Spotify account → next auth attempt should re-grant
- **Multiple rapid taps:** Tap button 5 times → should only start one OAuth flow

---

## FAQ

**Q: Why PKCE on Android but not Web?**
A: Web uses client_secret (secure on server). Android can't securely store client_secret, so PKCE adds a layer of protection against code interception.

**Q: Can I redirect to a custom domain on Android?**
A: Yes, but must register as a deep link in `AndroidManifest.xml`. Spotify requires the exact redirect URI to match what's registered in the Spotify app.

**Q: How long do tokens last?**
A: Access tokens: 1 hour. Refresh tokens: 1 month (non-expiring in some cases).

**Q: What if refresh token expires?**
A: User must re-authenticate. Show "Re-sync Spotify Library" button.

**Q: Can user have multiple Spotify accounts?**
A: Currently no — last login wins. To support multiple accounts, store tokens per-account.

**Q: Is it secure to store tokens in SharedPreferences?**
A: No for production. Use Android Keystore. Currently acceptable for MVP.

---

## Related Files

- `src/lib/spotify.ts` — Web OAuth helpers
- `src/app/api/auth/spotify/route.ts` — Web OAuth start
- `src/app/api/auth/spotify/callback/route.ts` — Web OAuth callback
- `src/app/api/spotify/matches/route.ts` — Web match engine
- `android/app/src/main/java/.../data/repository/SpotifyRepository.kt` — Android OAuth + API
- `android/app/src/main/java/.../ui/discover/SpotifyViewModel.kt` — Android state management
- `android/app/src/main/AndroidManifest.xml` — Deep link registration

---

## Spotify Developer Resources

- [OAuth 2.0 Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [PKCE (RFC 7636)](https://tools.ietf.org/html/rfc7636)
- [Web API Reference](https://developer.spotify.com/documentation/web-api)
- [Android App Registration](https://developer.spotify.com/documentation/android)
