# Platform Capabilities

*Verified against the code on 2026-07-26.*

| Feature | Category | Web | Android | Status / Implementation |
| :--- | :--- | :--- | :--- | :--- |
| `hydrationTracker` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `sunscreenAlert` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `waterCounter` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `sosMorseCode` | Health | ✅ | ✅ | Android: SOS beacon button in ToolsScreen |
| `batterySaver` | Tactical | ✅ | ✅ | Android: BatterySaverCard in ToolsScreen |
| `offlineBanner` | Tactical | ✅ | ✅ | Android: OfflineBanner component |
| `highContrast` | Accessibility | ✅ | ✅ | Android: High Contrast card implemented |
| `vibeQuiz` | Discovery | ✅ | ✅ | Android: VibeQuizScreen + VibeResultScreen |
| `aiRecommendations` | Discovery | ✅ | ✅ | Android: AI Scout panel in DiscoverScreen |
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
| `feedbackSystem` | Practical | ✅ | ✅ | Android: FeedbackSystemCard in ToolsScreen |
| `clashResolver` | Schedule | ✅ | ✅ | Android: tiered clash banner in ScheduleScreen. Needs schedule data (live for 5/6 festivals) |
| `setCountdowns` | Schedule | ✅ | ⏳ | Needs schedule data (live for 5/6 festivals); Android card pending |
| `groupSchedules` | Schedule | ⏳ | ⏳ | Not implemented on either platform |
| `accessibilityMap` | Map | ✅ | ✅ | Android: MapScreen accessible routes filter |
| `quietZones` | Map | ✅ | ✅ | Android: MapScreen quiet zone filter |
| `chargingStations` | Map | ✅ | ✅ | Android: MapScreen charging filter |
| `firstAidFinder` | Map | ✅ | ✅ | Android: MapScreen first aid filter |
| `tentFinder` | Map | ✅ | ✅ | Android: TentFinderCard in ToolsScreen |
| `friendFinder` | Social (P2P) | ✅ | ✅ | Android: FriendFinderScreen — QR generated for display, never scanned |
| `customThemes` | Personalization | ⏳ | ⏳ | Pending — per-user theme selection |
| `timetable` | Schedule | ✅ | ✅ | Full grid live for 5 of 6 festivals; `false` only for Ernte Punk (no data yet). Both grids zoom 10–260% with 2D pan — web via pinch / ctrl+wheel / double-tap / keys / FIT, Android via pinch / −+ / FIT |
| `currencyConverter` | Practical | ✅ | ✅ | Android: ToolsScreen card |
| `cashlessLink` | Practical | ✅ | ✅ | Outbound deep link to the festival's own top-up page only — we never handle balances or payments (NO CRITICAL INFRA) |
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
