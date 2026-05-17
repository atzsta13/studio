# 💎 Platform Capabilities

| Feature | Category | Web | Android | Status / Implementation |
| :--- | :--- | :--- | :--- | :--- |
| `hydrationTracker` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `sunscreenAlert` | Health | ✅ | ✅ | Android: ToolsScreen card |
| `waterCounter` | Health | ✅ | ⏳ | Android: card pending implementation |
| `vibeQuiz` | Discovery | ✅ | ✅ | Android: VibeQuizScreen + VibeResultScreen |
| `aiRecommendations` | Discovery | ✅ | ✅ | Android: AI Scout panel in DiscoverScreen |
| `artistTrivia` | Discovery | ✅ | ⏳ | Android: Detail screen section pending |
| `setlistLinks` | Discovery | ✅ | ⏳ | Android: Detail screen section pending |
| `arStageView` | Discovery | ✅ | ❌ | OUT OF SCOPE — Requires Camera |
| `secretStages` | Discovery | ⏳ | ⏳ | Blocked — needs unannounced location data |
| `budgetTracker` | Practical | ✅ | ✅ | Android: BudgetTrackerScreen |
| `notesJournal` | Practical | ✅ | ✅ | Android: NotesJournalScreen |
| `carFinder` | Practical | ✅ | ✅ | Android: CarFinderCard in ToolsScreen |
| `survivalGuide` | Practical | ✅ | ✅ | Android: SurvivalGuideScreen |
| `festivalDictionary` | Practical | ✅ | ✅ | Android: Guide section |
| `shuttleTimetable` | Practical | ✅ | ✅ | Android: Guide section |
| `weatherRadar` | Practical | ✅ | ✅ | Android: WeatherCard (Cached) |
| `merchCatalog` | Practical | ❌ | ❌ | OUT OF SCOPE — Low value |
| `merchPriceWatch` | Practical | ❌ | ❌ | OUT OF SCOPE — Low value |
| `squadLink` | Social (P2P) | ✅ | ✅ | Android: SquadLinkScreen (Local QR Sync) |
| `groupSchedules` | Social (P2P) | ⏳ | ⏳ | Blocked — needs schedule data |
| `clashResolver` | Tactical | ✅ | ⏳ | Android: blocked — needs startTime/endTime |
| `setCountdowns` | Tactical | ✅ | ⏳ | Android: blocked — needs startTime/endTime |
| `offlineBanner` | Tactical | ✅ | ✅ | Android: OfflineBanner component |
| `batterySaver` | Tactical | ✅ | ✅ | Android: BatterySaverCard in ToolsScreen |
| `audioMonitor` | Practical | ✅ | ✅ | Android: AudioMonitorCard |
| `fanPolls` | Social | ❌ | ❌ | OUT OF SCOPE — Requires live signal |
| `photoWall` | Social | ❌ | ❌ | OUT OF SCOPE — Requires live signal |
| `socialFeed` | Media | ❌ | ❌ | OUT OF SCOPE — Requires live signal |
| `crowdHeatmap` | Tactical | ❌ | ❌ | OUT OF SCOPE — Requires live signal |
| `newsBulletin` | Media | ✅ | ⏳ | Android: Static guide section pending |
| `highContrast` | Accessibility| ✅ | ✅ | Android: High Contrast card implemented |

---

## Summary

| Platform | Built | Blocked | Out of Scope |
|----------|-------|---------|--------------|
| Web | 40 | 3 | 7 |
| Android | 24 | 5 | 8 |

**Philosophy**: The app is designed to survive the "Main Stage Stress Test" — 100,000 people, zero signal, direct sunlight. Every feature listed as ✅ must function perfectly with 0 bars of signal.

---

## Design System

- **OLED First**: `OLEDBlack` bg, high-contrast for direct sunlight.
- **Signal Independence**: Prohibit features that require on-site connectivity.
- **Haptic Core**: `rememberHapticManager()` on every interactive element (Android).
- **Dynamic Theming**: All features adapt to festival's config.
