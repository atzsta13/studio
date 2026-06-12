# Troubleshooting Guide

> Last updated: 2026-06-12. Single-APK architecture — no product flavors.

## TLDR

| Problem | Fix |
|---|---|
| Web won't start | `npm install && npm run dev` |
| Android won't build | `cd android && ./gradlew clean && ./gradlew assembleDebug` |
| TypeScript errors | `npm run typecheck` — 4 pre-existing errors in `chart.tsx` are known/safe |
| Lineup data missing | Run `npm run lineup:sync` to sync all festival data |
| Festival not switching on Android | Clear app data: `adb shell pm clear com.example.festivalinsider` |

---

## Web

### `npm install` fails
```
npm ERR! ERESOLVE unable to resolve dependency tree
```
Fix: check Node version (`node -v` should be 20+). Delete `node_modules` and `package-lock.json`, then `npm install`.

### Fetch 404 on GitHub Pages but works locally
All `fetch()` calls for JSON must use `BASE_PATH`:
```ts
import { BASE_PATH } from '@/lib/base-path';
fetch(`${BASE_PATH}/data/${festivalId}/lineup.json`);
```
Without this, paths are absolute and 404 on the `/studio` sub-path.

### CSS variables not applying (festival theme broken)
`[festivalId]/layout.tsx` injects `--primary`, `--secondary` etc. via a `<style>` tag. If the theme looks wrong, check that `getFestivalConfig(festivalId)` returns the right config and that `primaryHsl` is a valid HSL string (not hex).

### Hydration mismatch errors
Use the `isMounted` pattern for any value that differs between SSR and client (e.g., localStorage reads, `Date.now()`):
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

---

## Android

### Build fails: `Could not find androidx.glance:glance-appwidget:X.X.X`
Glance has sparse version availability. Current pinned version: `1.1.1`. Check https://maven.google.com before upgrading.

### `FestivalConfig not initialized` crash
`FestivalConfig.initialize(context)` must be called in `MainActivity.onCreate()` before `setContent {}`. In tests, call `FestivalConfig.setTestConfig(mockConfig)` in test setup.

### Festival not loading after switch
`switchFestival()` restarts the app. If it loops, check that SharedPreferences is being written:
```bash
adb shell run-as com.example.festivalinsider cat shared_prefs/festival_insider_prefs.xml
```

### Room DB stale after festival switch
`AppDatabase.resetInstance()` is called inside `switchFestival()`. In tests, call it manually in teardown. DB name: `<festival_id_underscored>_database`.

### Asset file not found
All festival assets live under `src/main/assets/<festival-id>/`. If adding a new festival, create the directory with at minimum `config.json` and `lineup.json`. Run `npm run lineup:sync` to copy from `festivals/<id>/data/`.

### App stuck on splash / loops back to festival selection
Likely a bad `config.json`. Check logcat:
```bash
adb logcat -s FestivalInsider
```

### `adb` not found
```bash
export PATH="$HOME/Android/Sdk/platform-tools:$PATH"
```

---

## Data Pipeline

### Lineup sync produces no output
`npm run lineup:sync` should print `✓ [festival-id] Synced ...` for every festival. If silent, check `festivals/<id>/data/lineup.json` exists.

### After scraping, Android doesn't see new artists
Room caches the old data. Either:
- Clear app data: `adb shell pm clear com.example.festivalinsider`
- Or increment `@Database(version=N)` in `AppDatabase.kt` to force a destructive migration

### Timetable not showing for a festival
Check two things:
1. `features.timetable: true` in `festivals/<id>/config.json`
2. At least one artist in `lineup.json` has a non-null `startTime` in ISO 8601 format (`2026-06-11T20:00:00+02:00`)

Area 53 currently has times as plain strings (`"22:30"`) — the timetable will not work for it until migrated to ISO format.
