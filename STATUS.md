# 🚀 Project Status: Sziget Insider 2026

**Last Updated:** 2026-03-22
**Current Phase:** Phase 3 (Social & Tactical)
**Health:** 🟢 Green (Builds passing on Web & Android)

## 🏁 Recent Milestones
- **Design System Industrialization**: Created `DesignSystem.kt` with reusable Brutalist components.
- **Architectural Cleanup**: Extracted ViewModel logic from `ScheduleScreen` and fixed navigation state handling.
- **Performance Fix**: Implemented viewport-aware culling in the 2D Timetable Grid.
- **Verification**: Web and Android builds verified and pushed.

## 🛠️ Active "Hot Zones" (Where the brains are)
1. **Timetable Logic**: `android/.../ui/schedule/ScheduleViewModel.kt` & `ScheduleScreen.kt`
2. **Local Storage**: `android/.../data/local/UserDao.kt`
3. **AI Recommendations**: `src/ai/flows/recommend-artists-flow.ts`
4. **Source of Truth Data**: `src/data/lineup.json`

## 🔜 Next Priorities
- [ ] **Spotify Playlist Builder**: Implementation of the playlist generation flow in Android.
- [ ] **Grand Sync Logic**: Finalizing the bridge between Web AI results and Android local storage.
- [ ] **Offline Map Tiles**: Implementing MBTiles support for the Map screen.

## 📝 LLM / Agent Context
When joining this project, always check `CLAUDE.md` for coding standards and `docs/DEVELOPER_QUICKSTART.md` for environment setup.
