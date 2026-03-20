# Dependencies Reference

**Last updated:** 2026-03-20
**Scope:** Web (npm) + Android (Gradle) dependencies
**Goal:** Understand why each dependency exists + how to upgrade safely

---

## TLDR

- **Web:** 45 dependencies (Next.js, React 19, Tailwind, Radix UI)
- **Android:** 30 dependencies (Compose, Room, Kotlin, Gradle)
- **Major versions:** Keep pinned; test before upgrading
- **Security:** Run `npm audit` + `./gradlew dependencyCheckAnalyze`

---

## Table of Contents

1. [Web Dependencies](#web-dependencies)
2. [Android Dependencies](#android-dependencies)
3. [Version Strategies](#version-strategies)
4. [Upgrading Safely](#upgrading-safely)
5. [Security](#security)

---

## Web Dependencies

### Core Framework

| Package | Version | Why | Upgrade Path |
|---------|---------|-----|--------------|
| `next` | 16.x | App Router, React 19 integration, server components | Major release Q3 |
| `react` | 19.x | Latest React hooks, compiler, performance | Keep current |
| `react-dom` | 19.x | Virtual DOM, SSR | Keep current |

**Note:** React 19 stable (2026-03). Next.js 16 required for full compatibility.

### Styling

| Package | Version | Why | Notes |
|---------|---------|-----|-------|
| `tailwindcss` | 4.x | CSS-in-class utility framework, OLED black + neon accents | Breaking changes in v4 (watch upgrade) |
| `postcss` | 8.x | CSS processing pipeline | Required by Tailwind |
| `autoprefixer` | 10.x | Browser prefix generation | Required by Tailwind |

**Tailwind 3 → 4 migration concerns:**
- Color token syntax changed
- Config format slightly different
- Upgrade in dedicated PR; test all colors

### UI Components & Icons

| Package | Version | Why | Alternatives |
|---------|---------|-----|--------------|
| `@radix-ui/react-dialog` | 1.x | Accessible modal component | Headless UI, Floating UI |
| `@radix-ui/react-popover` | 1.x | Dropdown/popover primitives | Same |
| `lucide-react` | 0.x | Icon library (300+ icons) | React Icons, Heroicons |

**Why Radix + Lucide?**
- Radix: Zero-CSS, headless (we style with Tailwind)
- Lucide: Modern icons, tree-shakeable (~40KB total)

### AI & API Integration

| Package | Version | Why | Required |
|---------|---------|-----|----------|
| `@genkit-ai/core` | Latest | Genkit framework for flows | AI recommendations feature |
| `@genkit-ai/google-ai` | Latest | Google AI (Gemini 2.5 Flash) | AI model provider |
| `google-generative-ai` | Latest | Google Generative AI SDK | Genkit dependency |

**Cost per request:**
- Gemini 2.5 Flash: ~$0.001 (input) + $0.0002 (output)
- ~1000 requests/month budget at $1/month

### Utilities

| Package | Version | Why | Security |
|---------|---------|-----|----------|
| `axios` | 1.x | HTTP client | Prefer `fetch` (built-in) for new code |
| `js-cookie` | 3.x | Cookie management | Used for OAuth tokens |
| `zod` | 3.x | TypeScript schema validation | Validates API responses |

**Note:** Axios can be deprecated. Web uses native `fetch` mostly.

### Dev Dependencies

| Package | Version | Why |
|---------|---------|-----|
| `typescript` | 5.x | Type checking |
| `@types/node` | 20.x | Node.js type definitions |
| `eslint` | 8.x | Code linting |
| `prettier` | 3.x | Code formatting |
| `vitest` | 1.x | Test runner (Vite-native) |
| `@testing-library/react` | Latest | React component testing |

---

## Android Dependencies

### Gradle Build System

| Tool | Version | Why |
|------|---------|-----|
| `gradle` | 8.2+ | Build tool |
| `AGP` (Android Gradle Plugin) | 8.13.2 | Kotlin, Java compilation |
| `kotlin` | 2.0.21 | Language version |

**Gradle 8 upgrade:** No blockers; stable since 2023.

### Jetpack Compose & UI

| Library | Version | Why | Status |
|---------|---------|-----|--------|
| `androidx.compose.ui:ui` | Latest | Compose runtime | ✅ Stable |
| `androidx.compose.material3:material3` | Latest | Material 3 components | ✅ Stable |
| `androidx.compose.foundation:foundation` | Latest | Layout, gestures | ✅ Stable |

**Compose BOM:** Pins all Compose artifacts to compatible version. Always use BOM.

### Database (Room)

| Library | Version | Why | Migration |
|---------|---------|-----|-----------|
| `androidx.room:room-runtime` | 2.x | SQLite ORM | Schema v2 (fallbackToDestructiveMigration) |
| `androidx.room:room-compiler` | 2.x | Code generation | Keep matched with runtime |

**Room 2 → 3:** Upgrade blocked by SDK 35. Wait for 3.0 stable + AGP 9.

### Networking

| Library | Version | Why |
|---------|---------|-----|
| `androidx.test.espresso:espresso-core` | 3.5.1 | UI testing |
| No dedicated HTTP client | — | Use `java.net.URL` (built-in) |

**Note:** Android uses native `java.net.URL` + `httpURLConnection`. No OkHttp/Retrofit needed.

### Serialization

| Library | Version | Why | Pattern |
|---------|---------|-----|---------|
| `org.jetbrains.kotlinx:kotlinx-serialization-json` | 1.x | JSON parsing | `@Serializable` decorator |

**Always use:** `Json { ignoreUnknownKeys = true }` (forward-compatible)

### Other Libraries

| Library | Version | Why |
|---------|---------|-----|
| `androidx.lifecycle:lifecycle-viewmodel` | 2.x | ViewModel management |
| `androidx.lifecycle:lifecycle-runtime-compose` | 2.x | Compose lifecycle integration |
| `androidx.navigation:navigation-compose` | 2.x | Navigation routing |
| `androidx.constraintlayout:constraintlayout` | 2.x | Layout (fallback for Complex UIs) |
| `com.google.accompanist:accompanist-permissions` | 0.x | Permissions API |
| `io.coil-kt:coil-compose` | 2.x | Image loading |

### Glance Widget Libraries

| Library | Version | Why | Notes |
|---------|---------|-----|-------|
| `androidx.glance:glance-appwidget` | 1.1.0 | Home screen widget framework | ✅ Stable |
| `androidx.glance:glance-material3` | 1.1.0 | Material 3 theming for widgets | ✅ Stable |

**Glance:** Newer alternative to old RemoteViews. Compose-based, easier to maintain.

### Dev Dependencies

| Library | Version | Why |
|---------|---------|-----|
| `junit:junit` | 4.13.2 | Unit testing |
| `org.mockito:mockito-core` | 5.x | Mocking |
| `androidx.test:runner` | 1.5.2 | Android test runner |

---

## Version Strategies

### Semantic Versioning

```
1.2.3
│ │ └─ PATCH: bug fixes (safe to upgrade)
│ └─── MINOR: new features, backward compatible (safe, test)
└───── MAJOR: breaking changes (careful, read changelog)
```

### Pinning Strategy (Current)

```json
{
  "next": "16.0.0",           // Major pinned (stability)
  "react": "^19.0.0",         // Minor range (patch auto-updates)
  "tailwindcss": "4.0.0",     // Major pinned (breaking changes)
  "@genkit-ai/core": "latest" // Latest (active development)
}
```

**Rule of thumb:**
- `16.0.0` — Pin exact version (unstable APIs)
- `^16.1.0` — Allow patches (16.1.x)
- `~16.1.0` — Allow patches only (16.1.x, not 16.2.x)
- `latest` — For active projects (Genkit, testing libraries)

---

## Upgrading Safely

### Step 1: Check Compatibility

```bash
# Check for outdated packages
npm outdated

# Example output:
# tailwindcss 4.0.0 4.1.0 4.1.5    node_modules/tailwindcss
# next       16.0.0 16.1.0 16.1.5 node_modules/next
```

### Step 2: Read Changelog

```bash
# Example: Upgrading Next.js 16 → 17
# Check: https://nextjs.org/blog/next-17

# Key changes to watch:
# - Breaking API changes
# - Deprecations
# - New required config

# Example: Upgrading Tailwind 3 → 4
# Check: https://tailwindcss.com/docs/upgrade-guide

# Key breaking changes in v4:
# - Color syntax changed
# - @apply behavior different
# - CSS var generation
```

### Step 3: Create Branch

```bash
git checkout -b upgrade/tailwindcss-4.1
```

### Step 4: Update Dependency

```bash
# Upgrade one package at a time
npm install tailwindcss@4.1.0

# Test thoroughly
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

### Step 5: Test & Commit

```bash
# Verify all colors render correctly
npm run dev
# Visit /discover, /tools, /passport — check all accent colors

# If issues found, check changelog for breaking changes
# Edit src/styles/globals.css or tailwind.config.ts as needed

git commit -m "upgrade: tailwindcss 4.0 → 4.1"
git push origin upgrade/tailwindcss-4.1

# Create PR, test on staging before merging
```

### Android Upgrade Example

```bash
# Upgrade Kotlin 2.0 → 2.1
# In android/app/build.gradle.kts
kotlin {
  jvmToolchain(17)  // May need to bump JVM target
}

# Rebuild
./gradlew clean
./gradlew assembleDebug

# Test critical paths
adb shell am start -n com.example.szigerinsider2026/.MainActivity
```

---

## Security

### Check for Vulnerabilities

```bash
# Web
npm audit

# Example output:
# 1 vulnerability found
# │ Low        │ Prototype Pollution │ js-cookie
# │ severity   │

# Fix: npm audit fix (auto-patches if available)
# Or: npm install js-cookie@3.0.5 (specific version)

# Android
./gradlew dependencyCheckAnalyze
# (requires gradle dependency-check plugin)
```

### Known Vulnerabilities (As of 2026-03-20)

| Package | CVE | Severity | Status |
|---------|-----|----------|--------|
| js-cookie | (none) | — | ✅ Safe |
| tailwindcss | (none) | — | ✅ Safe |
| react | (none) | — | ✅ Safe |

**Subscribe to security alerts:**
- npm: `npm audit --audit-level=moderate`
- GitHub: Settings → Security → Dependabot alerts
- Android: Google Play Services security updates

---

## Dependency Tree

### Web

```
next 16.0.0
├── react 19.0.0
│   └── react-dom 19.0.0
├── tailwindcss 4.0.0
│   └── postcss 8.x
├── @radix-ui/react-dialog
│   └── @radix-ui/primitive
├── @genkit-ai/core
│   └── @genkit-ai/google-ai
│       └── google-generative-ai
└── lucide-react
```

### Android

```
androidx.compose.ui:ui-bom
├── androidx.compose.ui:ui
├── androidx.compose.material3:material3
├── androidx.compose.foundation:foundation
├── androidx.navigation:navigation-compose
└── androidx.lifecycle:lifecycle-runtime-compose

androidx.room:room-runtime v2.x
└── androidx.room:room-compiler (annotation processor)

org.jetbrains.kotlinx:kotlinx-serialization-json
└── kotlin-stdlib

androidx.glance:glance-appwidget 1.1.0
└── androidx.glance:glance-material3 1.1.0
```

---

## Cost Analysis

### API Costs

| Service | Model | Cost | Monthly Usage | Est. Cost |
|---------|-------|------|---|---|
| Google AI | Gemini 2.5 Flash | $0.075/M input tokens, $0.3/M output | 1000 req × 1500 tokens | $0.15 |
| Spotify API | — | Free tier (unlimited) | 100 users × 2500 tracks | Free |
| Open-Meteo | — | Free tier (unlimited) | 1000 requests/month | Free |

**Free tier sufficient** for festival scale (2000 users).

---

## Maintenance Checklist

Weekly:
- [ ] `npm outdated` — Check for new versions
- [ ] `npm audit` — Security scan

Monthly:
- [ ] Bump patch versions (`npm update`)
- [ ] Test build + deploy

Quarterly:
- [ ] Review major version upgrades
- [ ] Test on latest tooling

---

## Related Files

- `package.json` — Web dependencies
- `android/app/build.gradle.kts` — Android dependencies
- `docs/TROUBLESHOOTING.md` — Upgrade-related issues
- `CHANGELOG.md` — Version history (when created)
