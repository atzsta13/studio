# Platform Capabilities

| Feature | Category | Web | Android | Status / Implementation |
| :--- | :--- | :--- | :--- | :--- |
| `hydrationTracker` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `sunscreenAlert` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `waterCounter` | Health | ✅ | ⏳ | Android: card pending |
| `audioMonitor` | Health | ✅ | ✅ | Android: AudioMonitorCard |
| `sosMorseCode` | Health | ✅ | ✅ | Android: SOSScreen |
| `batterySaver` | Tactical | ✅ | ✅ | Android: BatterySaverCard in ToolsScreen |
| `offlineBanner` | Tactical | ✅ | ✅ | Android: OfflineBanner component |
| `highContrast` | Accessibility | ✅ | ✅ | Android: High Contrast card implemented |
| `vibeQuiz` | Discovery | ✅ | ✅ | Android: VibeQuizScreen + VibeResultScreen |
| `aiRecommendations` | Discovery | ✅ | ✅ | Android: AI Scout panel in DiscoverScreen |
| `setlistLinks` | Discovery | ✅ | ⏳ | Android: Detail screen section pending |
| `secretStages` | Discovery | ⏳ | ⏳ | Blocked — needs unannounced location data |
| `surpriseRoulette` | Discovery | ✅ | ✅ | Web: SerendipityModal; Android: SURPRISE button |
| `genreBreakdown` | Discovery | ✅ | ✅ | Android: DiscoverScreen chart |
| `vibeAnalysis` | Discovery | ✅ | ✅ | Android: DiscoverScreen vibe panel |
| `similarArtists` | Discovery | ✅ | ✅ | Android: ArtistDetailScreen |
| `vibeOfTheHour` | Discovery | ✅ | ✅ | Android: DiscoverScreen widget |
| `afterMovie` | Discovery | ⏳ | ⏳ | Pending — link to official recap video |
| `budgetTracker` | Practical | ✅ | ✅ | Android: BudgetTrackerScreen |
| `notesJournal` | Practical | ✅ | ✅ | Android: NotesJournalScreen |
| `carFinder` | Practical | ✅ | ✅ | Android: CarFinderCard in ToolsScreen |
| `survivalGuide` | Practical | ✅ | ✅ | Android: SurvivalGuideScreen |
| `festivalDictionary` | Practical | ✅ | ✅ | Android: Guide section |
| `shuttleTimetable` | Practical | ✅ | ✅ | Android: Guide section |
| `weatherRadar` | Practical | ✅ | ✅ | Android: WeatherCard (cached) |
| `lostAndFound` | Practical | ✅ | ✅ | Android: Guide section |
| `foodRatings` | Practical | ✅ | ✅ | Android: FoodScreen ratings |
| `posterGenerator` | Practical | ⏳ | ⏳ | Pending — shareable highlights image |
| `newsBulletin` | Practical | ⏳ | ⏳ | Pending — static pre-loaded announcements |
| `feedbackSystem` | Practical | ⏳ | ⏳ | Pending — in-app feedback for organizers |
| `clashResolver` | Schedule | ✅ | ⏳ | Android: blocked — needs startTime/endTime |
| `setCountdowns` | Schedule | ✅ | ⏳ | Android: blocked — needs startTime/endTime |
| `groupSchedules` | Schedule | ⏳ | ⏳ | Blocked — needs schedule data |
| `accessibilityMap` | Map | ✅ | ✅ | Android: MapScreen accessible routes filter |
| `quietZones` | Map | ✅ | ✅ | Android: MapScreen quiet zone filter |
| `chargingStations` | Map | ✅ | ✅ | Android: MapScreen charging filter |
| `firstAidFinder` | Map | ✅ | ✅ | Android: MapScreen first aid filter |
| `tentFinder` | Map | ✅ | ✅ | Android: TentFinderCard in ToolsScreen |
| `friendFinder` | Social (P2P) | ✅ | ✅ | Android: SquadLinkScreen (Local QR Sync) |
| `stageCapacity` | Tactical | ⏳ | ⏳ | Pending — stage crowd level display |
| `customThemes` | Personalization | ⏳ | ⏳ | Pending — per-user theme selection |
| `timetable` | Schedule | ✅ | ✅ | Gating flag; full schedule blocked until data |
| `currencyConverter` | Practical | ✅ | ✅ | Android: ToolsScreen card |
| `cashlessLink` | Practical | ✅ | ✅ | Deep link to festival cashless top-up |
| `dayparkNightpark` | Schedule | ✅ | ✅ | Frequency-specific day/night split |
| `familyZone` | Map | ⏳ | ⏳ | Pending — family area POI filter |

---

## Summary

| Platform | Built | Blocked / Pending | Permanently excluded |
|----------|-------|-------------------|----------------------|
| Web | ~30 | ~10 | fanPolls, photoWall, socialFeed, crowdHeatmap, arStageView, collabPlaylists, merchCatalog |
| Android | ~25 | ~10 | (same) |

**Philosophy**: Every ✅ feature must pass the Main Stage Test — 100,000 people, zero signal, direct sunlight. See `docs/GOALS.md` for the purpose behind each feature.

---

## Design System

- **OLED First**: Dark backgrounds optimised for direct sunlight readability.
- **Signal Independence**: No feature may require on-site connectivity.
- **Haptic Core**: `rememberHapticManager()` on every interactive element (Android).
- **Config First**: All features adapt to the active festival's `config.json`.
