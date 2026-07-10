# Handoff: Improve the Android app — Festival Insider Platform

> Transient working brief for the next AI tool (e.g. Gemini) picking up the **Android app**.
> The canonical sources are `AGENTS.md`, `android/README.md`, and `TASKS.md` — this file just orients you and points there. Delete/refresh it when the work below is done.

A previous session (Claude, 2026-07-10) finished data fixes, an AI-Scout refactor, dependency bumps, and a build-speed pass. Everything referenced here is committed and pushed to `main`.

## Start here (do not skip)
1. **`AGENTS.md`** — single source of truth for all AI tools (your `GEMINI.md` imports it). Rules, commands, architecture.
2. **`android/README.md`** — Android architecture + screen routes.
3. **`TASKS.md`** — the live backlog. The **P3 — Android** section is your work queue, with exact file paths.
4. **`docs/STATUS.md`** "Recently Shipped" (2026-07-10 entries) — what just changed.

## Working directory & build loop
- Code: `android/app/src/main/java/com/example/szigerinsider2026/`
- Build the APK: `./android/gradlew -p android assembleDebug` (~3s warm — Gradle caches are enabled)
- Tests: `./android/gradlew -p android testDebugUnitTest`
- **Definition of done (Android):** both green. Verify by building — don't claim done off a read.

## Hard constraints (violating these breaks the product)
- **CONFIG-FIRST:** never hardcode festival names/dates/colors/coordinates. Use `FestivalConfig.current`. Each festival ships its own `config.json`.
- **NO** accounts, social, camera, or data collection. All user state is local.
- **OFFLINE-FIRST:** core features must work with zero signal. Assets are bundled per festival under `src/main/assets/<festival-id>/`.
- **Haptics** are mandatory on interactive elements via `rememberHapticManager()`.
- **Room:** bump `@Database(version=)` on any entity change (uses `fallbackToDestructiveMigration`).
- **Do not "optimize" `FestivalConfig.switchFestival()`** — it kills the process on purpose to avoid closed-DB races.
- No Hilt (manual `ViewModelProvider.Factory`); `tasks-genai` is pinned at 0.10.14.

## Recommended task order (from TASKS.md P3 — Android)
1. **Feature parity — `waterCounter` and `feedbackSystem`.** Both flags are `true` and the **web** app implements them; Android doesn't. Grep the flag name across `src/` to find the web reference implementation, then mirror it. `waterCounter` → a card in `ui/tools/ToolsScreen.kt`; `feedbackSystem` → a card (Tools/Home). Best first task: self-contained, visible, verifiable.
2. **Accessibility pass** — no `contentDescription` audit has ever been done. Many `Icon(...)` calls pass `contentDescription = null`.
3. **AI Scout — two items remain** (the prompt layer was already refactored to bounded, config-driven retrieval): (a) real token streaming via `generateResponseAsync`; (b) the Acoustic Scout needs time-based candidate filtering to actually answer "who's playing now." Details in `TASKS.md`.
4. **`applicationId` is still `com.example.festivalinsider`** — must change before any Play Store release (DB/asset-path implications; do it deliberately).
5. **Tests** — `ArtistViewModel`/`ToolsViewModel` have none (need Room in-memory / a network fake); zero instrumented UI tests.

## Gotchas that will bite you
- **Don't re-add `setlistLinks`** — removed on purpose (UI-only link-out, no data).
- **Data:** the Area 53 Sat 12:30 act is **`Apis`** (its logo misreads as "ARIS") — don't "correct" it.
- **Generated dirs** `android/app/src/main/assets/<id>/` are synced from `festivals/<id>/` by `npm run lineup:sync` — never hand-edit them.
- **Web deploy is paused** (site under maintenance) — irrelevant to Android, but don't be confused by the commented-out workflow.

## Ground truth at handoff (2026-07-10)
Toolchain is current: SDK 36, Gradle 9.5.1, AGP 9.2.0, Kotlin 2.3.20, JDK 21, Compose BOM 2026.06.01. App builds green; unit tests pass.
