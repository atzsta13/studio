# Troubleshooting Guide

**Last updated:** 2026-03-20
**Format:** Problem → Root Cause → Solution
**For:** Developers, LLMs, and the future-you at 2am

---

## TLDR

- **Web won't start?** `npm install && npm run dev`
- **Android won't build?** `./gradlew clean && ./gradlew assembleDebug`
- **TypeScript errors?** `npm run typecheck` (known pre-existing issues, doesn't block build)
- **Lineup data missing?** Copy `src/data/lineup.json` to `android/app/src/main/assets/lineup.json`

---

## Table of Contents

1. [Web Development](#web-development)
2. [Android Development](#android-development)
3. [Data & Build](#data--build)
4. [General](#general)

---

## Web Development

### Problem: `npm install` fails

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Causes:**
1. Node version mismatch
2. Lock file corrupted
3. Conflicting peer dependencies

**Solution:**
```bash
# Check Node version (should be 18+)
node --version

# Clear cache
npm cache clean --force

# Remove lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, force resolution
npm install --legacy-peer-deps
```

---

### Problem: `npm run dev` won't start

**Error:**
```
Error: listen EADDRINUSE
```

**Cause:**
Port conflict or corrupted `.next` cache.

**Solution:**
```bash
rm -rf .next
npm run dev
```

---

### Problem: Port 9002 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::9002
```

**Cause:**
Another process using port 9002.

**Solution:**
```bash
# Find & kill process
lsof -i :9002
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

---


### Problem: Components not updating after edit

**Cause:**
Next.js hot reload not detecting changes (file watcher issue).

**Solution:**
```bash
# Stop dev server
Ctrl+C

# Clear .next cache
rm -rf .next

# Restart
npm run dev
```

---

### Problem: Weather widget shows no data

**Cause:**
Open-Meteo API is down or there's no network connection. The widget fetches directly from `api.open-meteo.com` client-side.

**Solution:**
```bash
# Test API directly
curl 'https://api.open-meteo.com/v1/forecast?latitude=47.5&longitude=19.05&daily=temperature_2m_max'
```

Weather is non-critical — the rest of the app works offline.

---

## Android Development

### Problem: `./gradlew` command not found

**Cause:**
Not in `android/` directory.

**Solution:**
```bash
cd android
./gradlew assembleDebug

# Or from root
android/gradlew assembleDebug
```

---

### Problem: `./gradlew` fails with "Permission denied"

**Cause:**
Gradle wrapper not executable.

**Solution:**
```bash
chmod +x android/gradlew
./gradlew assembleDebug
```

---

### Problem: Build fails with "Gradle daemon stopped unexpectedly"

**Cause:**
Out of memory or corrupted daemon.

**Solution:**
```bash
# Stop daemon
./gradlew --stop

# Clear caches
rm -rf android/.gradle
rm -rf android/app/build

# Rebuild
./gradlew assembleDebug
```

---

### Problem: "Could not find lineup.json" in Android build

**Error:**
```
FileNotFoundException: open('lineup.json')
```

**Cause:**
Lineup data not copied to Android assets.

**Solution:**
```bash
# Copy from Web
cp src/data/lineup.json android/app/src/main/assets/lineup.json

# Verify
ls android/app/src/main/assets/lineup.json

# Rebuild
./gradlew assembleDebug
```

---

### Problem: Kotlin compilation errors

**Example:**
```
error: Unresolved reference 'Icons.Outlined.Star'
```

**Cause:**
Missing import or icon doesn't exist in Material Icons.

**Solution:**
```kotlin
// Check available imports
// androidx.compose.material.icons.filled.Star ✅
// androidx.compose.material.icons.outlined.Star ❌ (doesn't exist)

// Use workaround
import androidx.compose.material.icons.filled.Star

// Or find alternative icon
import androidx.compose.material.icons.outlined.StarBorder
```

---

### Problem: Room database crashes on schema change

**Error:**
```
java.lang.IllegalStateException: Room cannot verify the data integrity
```

**Cause:**
Entity changed but `@Database(version = N)` not incremented.

**Solution:**
```kotlin
// In AppDatabase.kt
@Database(
  version = 3  // ← Increment this (was 2)
)
abstract class AppDatabase : RoomDatabase() {
  // ...
}
```

**WARNING:** Incrementing version wipes user data in dev builds. Test on a fresh database.

---

### Problem: APK install fails

**Error:**
```
cmd: Can't install because you're replacing incompatible package
```

**Cause:**
Signature mismatch or version conflict.

**Solution:**
```bash
# Uninstall old version
adb uninstall com.example.szigerinsider2026

# Reinstall
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Problem: Emulator is slow

**Cause:**
Hardware acceleration disabled or emulator misconfigured.

**Solution:**
```bash
# Enable GPU in emulator
# Android Studio → AVD Manager → Edit → Graphics: "Automatic" or "Hardware"

# Or use faster emulator
# -enable-hw-keyboard -no-window -gpu on

# Restart emulator
adb emu kill
emulator -avd <name> -gpu on
```

---

### Problem: Haptic feedback not working

**Cause:**
- Emulator doesn't support vibration
- Device vibration disabled
- HapticManager not initialized

**Solution:**
```kotlin
// Check HapticManager is available
val haptic = rememberHapticManager()

// Test with explicit vibrator
val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))

// Enable vibration in system settings (Device Settings → Sound & Vibration)
```

---

## Data & Build

### Problem: Lineup data out of sync between Web and Android

**Cause:**
Forgot to copy after updating Web lineup.

**Solution:**
```bash
# After any src/data/lineup.json update
npm run lineup:sync  # Re-sync data after update

# Copy to Android
cp src/data/lineup.json android/app/src/main/assets/lineup.json

# Rebuild Android
./gradlew assembleDebug

# Verify on both platforms
# Web: npm run dev → /discover
# Android: open APK in emulator → Discover tab
```

---

### Problem: Vibes are missing/empty

**Cause:**
Lineup updated but vibes not backfilled.

**Solution:**
```bash
# Run vibe backfill
node scripts/backfill-vibes.mjs

# Verify
npm run lineup:show | grep -A3 "vibes"

# Copy to Android
cp src/data/lineup.json android/app/src/main/assets/lineup.json
```

---

### Problem: Build size too large

**Warning:**
```
Bundle size: 2.5 MB (should be <2 MB)
```

**Cause:**
Unused dependencies or large images.

**Solution:**
```bash
# Analyze bundle
npm run build
npm list --depth=0  # Check installed packages

# Remove unused
npm uninstall <package>

# Check image sizes
find public -name "*.jpg" -o -name "*.png" | xargs du -h
```

---


## General

### Problem: "This shouldn't happen" error

**Cause:**
Unknown or edge case not covered.

**Solution:**
1. **Reproduce:** Follow exact steps to recreate
2. **Isolate:** Test in new browser/emulator session
3. **Log:** Add console.log around suspected code
4. **Report:** File issue in KNOWN_ISSUES.md with:
   - Exact error message
   - Steps to reproduce
   - Environment (OS, browser/Android version, Node version)
   - Screenshots/video if UI involved

---

### Problem: Hot reload not working

**Cause:**
- File watcher limit exceeded
- Next.js caching issue
- Webpack rebuild failed

**Solution:**
```bash
# Increase file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Clear caches
rm -rf .next
rm -rf android/.gradle

# Restart dev server
npm run dev
```

---

### Problem: LLM can't find a file

**Cause:**
File path wrong or LLM using outdated mental model.

**Solution:**
```bash
# Find file
find . -name "*.kt" -o -name "*.tsx" | grep ArtistCard

# Glob in correct directory
ls src/components/**/ArtistCard.*

# Read file to verify
cat src/components/artist/ArtistCard.tsx | head -20
```

---

### Problem: "I don't know where to start"

**Solution:**
1. **Check status:** `git status`
2. **Read docs:** Start with `README.md`, then `CLAUDE.md`
3. **Find similar code:** `grep -r "pattern_you_want"`
4. **Ask LLM:** "Explain how [existing feature] works"
5. **Write test first:** TDD approach prevents guessing

---

## Emergency Contacts

- **Can't build?** → Clear caches (`rm -rf node_modules .next android/.gradle`)
- **Lost data?** → Check git history (`git log --oneline`)
- **Broke something?** → Revert last commit (`git revert HEAD`)
- **Still stuck?** → File issue in KNOWN_ISSUES.md with full context

---

## Prevention

**To avoid most issues:**

```bash
# Daily dev workflow
npm test                    # Catch errors early
npm run typecheck          # Find type issues
npm run lint               # Style issues

# Before committing
git status                 # Check what changed
git diff                   # Review changes
npm test -- --run          # Run tests once

# Before pushing
npm run build              # Full build check
./gradlew assembleDebug    # Android build check
```

---

## Related Files

- `docs/guides/KNOWN_ISSUES.md` — Documented bugs + solutions
- `docs/guides/DEVELOPMENT.md` — Setup instructions
- `README.md` — Quick start guide
- `CLAUDE.md` — Project instructions for AI
