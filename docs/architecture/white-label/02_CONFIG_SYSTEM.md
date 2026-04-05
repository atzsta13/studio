# Festival Config System

The config system is the single source of truth for all festival-specific values on both platforms. This document defines the full TypeScript interface, all four festival config objects, and the modular feature registry.

---

## Web Configuration: `src/config/festival.ts`

The `FESTIVAL` constant is exported based on the `NEXT_PUBLIC_FESTIVAL_ID` environment variable.

### Master Feature Registry (50 Toggles)

Every feature in the app is wired to a boolean flag. If `false`, the UI component is completely unmounted and logic is skipped.

```typescript
export interface FestivalFeatureFlags {
  // Core Modules
  currencyConverter: boolean
  tentFinder: boolean
  vibeQuiz: boolean
  spotifyIntegration: boolean
  aiRecommendations: boolean
  survivalGuide: boolean
  timetable: boolean
  cashlessLink: boolean
  cashlessUrl?: string
  dayparkNightpark: boolean
  familyZone: boolean

  // Hyper-Insider Expansion (New)
  hydrationTracker: boolean    // Visual water intake circle
  sunscreenAlert: boolean      // Dynamic UV warning banner
  batterySaver: boolean        // Global "No Animations" mode
  friendFinder: boolean        // Squad QR code sharing
  groupSchedules: boolean      // Shared friend timetables
  artistTrivia: boolean        // Discovery gamification
  similarArtists: boolean      // "More Like This" on Artist pages
  vibeOfTheHour: boolean       // Featured artist based on time
  stageCapacity: boolean       // Real-time density indicators
  merchCatalog: boolean        // Pre-order and stock checker
  foodRatings: boolean         // Community star ratings
  budgetTracker: boolean       // Personal spending ledger
  lostAndFound: boolean        // Digital community board
  sosMorseCode: boolean        // Screen-flash SOS beacon
  festivalDictionary: boolean  // Local slang and term lookup
  firstAidFinder: boolean      // Highlight medical points
  chargingStations: boolean    // Highlight power points
  shuttleTimetable: boolean    // Official transport routes
  weatherRadar: boolean        // Animated Island weather map
  setlistLinks: boolean        // Direct links to setlist.fm
  collabPlaylists: boolean     // Shared Spotify folders
  arStageView: boolean         // Mocked tactical radar overlay
  stickerBook: boolean         // Digital stamp collection
  fanPolls: boolean            // Live crowd voting
  photoWall: boolean           // Community photo stream
  clashResolver: boolean       // Overlap detection logic
  posterGenerator: boolean     // Social shareable line-up
  customThemes: boolean        // Festival-specific UI skins
  waterCounter: boolean        // Tally-based hydration log
  carFinder: boolean           // GPS parking locator
  notesJournal: boolean        // Private memory vault
  socialFeed: boolean          // Curated festival news
  newsBulletin: boolean        // Emergency alert system
  setCountdowns: boolean       // Live timer to set start
  surpriseRoulette: boolean    // Shake-to-find random act
  genreBreakdown: boolean      // Lineup DNA visualization
  vibeAnalysis: boolean        // Personalized Radar chart
  accessibilityMap: boolean    // Wheelchair & access routes
  quietZones: boolean          // Sensory-friendly locations
  crowdHeatmap: boolean        // Mocked stage density
  merchPriceWatch: boolean     // Alert on price drops
  secretStages: boolean        // Alert on hidden locations
  afterMovie: boolean          // Link to official media
  feedbackSystem: boolean      // Direct transmission to HQ
  offlineBanner: boolean       // Connectivity status alert
  highContrast: boolean        // Accessibility visual mode
}
```

---

## State Management: `InsiderProvider`

All modular features are controlled via the `useInsider()` hook. This hook provides:
1.  **Feature Access**: Check `features.hydrationTracker` before rendering.
2.  **Global Modes**: Manage `batterySaver` and `isOnline` states centrally.
3.  **Storage Isolation**: Use `getStorageKey(key)` to automatically prefix `localStorage` with the current festival ID.

```tsx
const { features, batterySaver, isOnline } = useInsider();

if (features.hydrationTracker) {
  return <HydrationTracker />;
}
```

---

## Modularity & Toggling

### How to Disable a Feature
1.  Navigate to `festivals/<id>/config.json`.
2.  Set the feature key to `false`.
3.  The feature will immediately disappear from the build.

### Android Equivalent
The `FestivalConfig.kt` data class in Android is synchronized 1:1 with the JSON. Gradle product flavors (e.g., `assembleSzigetDebug`) automatically load the correct `config.json` into the `FestivalConfig` singleton.

---

## Config Manifest Location
- **Sziget**: `festivals/sziget-2026/config.json`
- **Nova Rock**: `festivals/novarock-2026/config.json`
- **Area 53**: `festivals/area53-2026/config.json`
- **Frequency**: `festivals/frequency-2026/config.json`
