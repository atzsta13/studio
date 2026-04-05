# Feature Status & Hyper-Insider Ecosystem

The Festival Insider Platform is now a **Hyper-Insider** ecosystem with 50+ modular features controlled by a central configuration engine.

**Legend:**
- ✅ **Built & Configurable** — wired to `FESTIVAL.features` and fully functional on Web.
- 📱 **Android Ready** — configuration flag active; UI implementation follows white-label patterns.
- ⏳ **Awaiting Data** — core logic active, requires 2026 official schedule/POI updates.

---

## 🚀 Hyper-Insider Modular Features (Master List)

| Feature | Category | Web | Android | Description |
|:---|:---|:---:|:---:|:---|
| `hydrationTracker` | Health | ✅ | 📱 | Visual circular water intake log |
| `sunscreenAlert` | Health | ✅ | 📱 | Dynamic UV warning banner based on index |
| `quietZones` | Health | ✅ | 📱 | Map overlay for sensory-friendly spots |
| `waterCounter` | Health | ✅ | 📱 | Tally-based glass counter in Toolkit |
| `sosMorseCode` | Safety | ✅ | 📱 | Tactical screen-flash SOS beacon |
| `firstAidFinder` | Safety | ✅ | 📱 | Highlight medical points on the Radar |
| `feedbackSystem` | Safety | ✅ | 📱 | Direct transmission channel to HQ |
| `surpriseRoulette` | Discovery | ✅ | 📱 | Shake-to-find random artist discovery |
| `vibeOfTheHour` | Discovery | ✅ | 📱 | Time-based featured artist spotlight |
| `genreBreakdown` | Discovery | ✅ | 📱 | Visualization of lineup DNA |
| `artistTrivia` | Discovery | ✅ | 📱 | Interactive artist knowledge quiz |
| `similarArtists` | Discovery | ✅ | 📱 | Cross-match discovery on artist pages |
| `setlistLinks` | Discovery | ✅ | 📱 | Direct connection to setlist.fm |
| `vibeAnalysis` | Discovery | ✅ | 📱 | Personalized Vibe Radar (Radar Chart) |
| `arStageView` | Discovery | ✅ | 📱 | Mocked tactical radar overlay |
| `secretStages` | Discovery | ⏳ | 📱 | Alerts for unannounced locations |
| `budgetTracker` | Practical | ✅ | 📱 | Personal local spending ledger |
| `notesJournal` | Practical | ✅ | 📱 | Private memory and contact vault |
| `carFinder` | Practical | ✅ | 📱 | GPS-based parking spot locator |
| `festivalDictionary` | Practical | ✅ | 📱 | Local slang and island terminology |
| `shuttleTimetable` | Practical | ✅ | 📱 | Official transport routes & schedules |
| `weatherRadar` | Practical | ✅ | 📱 | Visual animated island weather map |
| `merchCatalog` | Practical | ✅ | 📱 | Pre-order and stock management |
| `merchPriceWatch` | Practical | ✅ | 📱 | Push alerts for merch price drops |
| `friendFinder` | Social | ✅ | 📱 | Squad QR code sharing & tracking |

| `fanPolls` | Social | ✅ | 📱 | Live crowd voting & sentiment |
| `photoWall` | Social | ✅ | 📱 | Community curated photo stream |
| `groupSchedules` | Social | ⏳ | 📱 | Shared friend timetable merging |
| `clashResolver` | Tactical | ✅ | 📱 | Overlap detection & resolution |
| `stageCapacity` | Tactical | ⏳ | 📱 | Real-time stage density indicators |
| `crowdHeatmap` | Tactical | ✅ | 📱 | Mocked visual density on Radar |
| `setCountdowns` | Tactical | ✅ | 📱 | Live timer to set start |
| `offlineBanner` | Tactical | ✅ | 📱 | Connectivity status logic |
| `batterySaver` | Tactical | ✅ | 📱 | Global "No-Anim" OLED power mode |
| `highContrast` | Tactical | ✅ | 📱 | Accessibility visual mode |
| `afterMovie` | Media | ✅ | 📱 | Link to official media archive |
| `socialFeed` | Media | ✅ | 📱 | Curated festival news stream |
| `newsBulletin` | Media | ✅ | 📱 | Emergency and tactical alerts |

---

## 🎨 Design System (Brutalist Core)

- **OLED First**: Optimized for high-contrast visibility in direct sunlight.
- **Dynamic Theming**: All 50 features adapt to the festival's specific `primaryHex` and `accentHex`.
- **Haptic Core**: (Android Only) `HapticManager` wired to all interactive modules.

---

## 🛠️ Modularity Guide

### Turning Features On/Off
1.  Open `festivals/<id>/config.json`.
2.  Toggle the boolean flag in the `features` object.
3.  The system automatically:
    - Removes Nav links.
    - Unmounts UI components.
    - Bypasses background logic.

### Cross-Platform Sync
- **Web**: Consumes `FESTIVAL.features` via `useInsider()`.
- **Android**: Consumes `FestivalConfig.FEATURES` via Kotlin data classes.
