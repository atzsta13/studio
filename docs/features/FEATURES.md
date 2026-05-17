# Feature Status & Hyper-Insider Ecosystem

**Last updated:** May 17, 2026

**Legend:**
- ✅ **Built** — fully implemented and wired to feature flag
- ⏳ **Awaiting Data** — logic exists, requires official schedule/POI data from Sziget
- ❌ **Not built** — flag exists in config, no UI yet

---

## Master Feature Table

| Feature | Category | Web | Android | Notes |
|:---|:---|:---:|:---:|:---|
| `hydrationTracker` | Health | ✅ | ✅ | Web: circular visual. Android: card in ToolsScreen |
| `sunscreenAlert` | Health | ✅ | ❌ | Android: flag wired, no UI yet |
| `quietZones` | Health | ✅ | ❌ | Android: flag wired, no UI yet |
| `waterCounter` | Health | ✅ | ❌ | Android: flag wired, no UI yet |
| `sosMorseCode` | Safety | ✅ | ✅ | Android: FlashOverlay in ToolsScreen |
| `firstAidFinder` | Safety | ✅ | ✅ | Android: highlighted on MapScreen |
| `feedbackSystem` | Safety | ✅ | ❌ | Android: flag wired, no UI yet |
| `surpriseRoulette` | Discovery | ✅ | ✅ | Android: SerendipityScreen (full-screen modal) |
| `vibeOfTheHour` | Discovery | ✅ | ❌ | Android: flag wired, no UI yet |
| `genreBreakdown` | Discovery | ✅ | ✅ | Android: GenreBreakdownScreen — animated bar chart |
| `artistTrivia` | Discovery | ✅ | ❌ | Android: flag wired, no UI yet |
| `similarArtists` | Discovery | ✅ | ✅ | Android: "More Like This" row in ArtistDetailScreen |
| `setlistLinks` | Discovery | ✅ | ❌ | Android: flag wired, no UI yet |
| `vibeAnalysis` | Discovery | ✅ | ✅ | Android: VibeRadarScreen — Canvas spider chart |
| `arStageView` | Discovery | ✅ | ❌ | Android: flag wired, no UI yet |
| `secretStages` | Discovery | ⏳ | ⏳ | Blocked — needs unannounced location data |
| `budgetTracker` | Practical | ✅ | ✅ | Android: BudgetTrackerScreen — arc ring, SharedPreferences |
| `notesJournal` | Practical | ✅ | ✅ | Android: NotesJournalScreen — FAB compose, categories |
| `carFinder` | Practical | ✅ | ✅ | Android: CarFinderCard in ToolsScreen |
| `festivalDictionary` | Practical | ✅ | ✅ | Android: section in SurvivalGuideScreen |
| `shuttleTimetable` | Practical | ✅ | ✅ | Android: section in SurvivalGuideScreen |
| `weatherRadar` | Practical | ✅ | ✅ | Android: WeatherCard in ToolsScreen |
| `merchCatalog` | Practical | ✅ | ❌ | Android: flag wired, no UI yet |
| `merchPriceWatch` | Practical | ✅ | ❌ | Android: flag wired, no UI yet |
| `friendFinder` | Social | ✅ | ✅ | Android: FriendFinderScreen — ZXing QR code |
| `fanPolls` | Social | ✅ | ❌ | Android: flag wired, no UI yet |
| `photoWall` | Social | ✅ | ❌ | Android: flag wired, no UI yet |
| `groupSchedules` | Social | ⏳ | ⏳ | Blocked — needs schedule data |
| `clashResolver` | Tactical | ✅ | ⏳ | Android: blocked — needs startTime/endTime |
| `stageCapacity` | Tactical | ⏳ | ⏳ | Blocked — needs live density data |
| `crowdHeatmap` | Tactical | ✅ | ❌ | Android: flag wired, no UI yet |
| `setCountdowns` | Tactical | ✅ | ⏳ | Android: blocked — needs startTime/endTime |
| `offlineBanner` | Tactical | ✅ | ✅ | Android: OfflineBanner component |
| `batterySaver` | Tactical | ✅ | ✅ | Android: BatterySaverCard in ToolsScreen |
| `highContrast` | Tactical | ✅ | ❌ | Android: flag wired, no UI yet |
| `afterMovie` | Media | ✅ | ❌ | Android: flag wired, no UI yet |
| `socialFeed` | Media | ✅ | ❌ | Android: flag wired, no UI yet |
| `newsBulletin` | Media | ✅ | ❌ | Android: flag wired, no UI yet |
| `vibeQuiz` | Discovery | ✅ | ✅ | Android: VibeQuizScreen + VibeResultScreen |
| `aiRecommendations` | Discovery | ✅ | ✅ | Android: AI Scout panel in DiscoverScreen |
| `survivalGuide` | Practical | ✅ | ✅ | Android: SurvivalGuideScreen |
| `timetable` | Tactical | ⏳ | ⏳ | Blocked — awaiting Sziget schedule |
| `currencyConverter` | Practical | ✅ | ✅ | Android: LocalCurrencyConverterCard in ToolsScreen |
| `tentFinder` | Practical | ✅ | ✅ | Android: TentFinderCard in ToolsScreen |
| `audioMonitor` | Practical | ✅ | ✅ | Android: AudioMonitorCard in ToolsScreen |

---

## Summary

| Platform | Built | Blocked by data | Not built |
|----------|-------|-----------------|-----------|
| Web | 40 | 5 | 0 |
| Android | 24 | 5 | 16 |

**Android "not built" (16):** sunscreenAlert, quietZones, waterCounter, feedbackSystem, vibeOfTheHour, artistTrivia, setlistLinks, arStageView, merchCatalog, merchPriceWatch, fanPolls, photoWall, crowdHeatmap, highContrast, afterMovie, socialFeed, newsBulletin. All have config flags — can be added as isolated ToolsScreen cards or new routes without touching existing code.

---

## Design System

- **OLED First**: `OLEDBlack` bg, high-contrast for direct sunlight
- **Color tokens**: `AcidYellow`, `PrimaryMagenta`, `CyanPulse`, `ToxicGreen` (see `Color.kt`)
- **Haptic Core**: `rememberHapticManager()` on every interactive element (Android)
- **Dynamic Theming**: All features adapt to festival's `primaryHex`/`accentHex` from config

---

## Turning Features On/Off

1. Open `festivals/<id>/config.json`
2. Toggle the boolean flag in the `features` object
3. Web: `useInsider()` / `FESTIVAL.features` controls rendering automatically
4. Android: `FestivalConfig.current.features` controls rendering automatically
