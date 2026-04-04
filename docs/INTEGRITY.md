# 🛡️ Festival Insider: Integrity & Maintenance Protocol

To maintain the speed and reliability of our **Monolithic Architecture**, all contributors (AI and Human) must adhere to these pillars of structural health. This protocol prevents "architectural drift" and ensures the ecosystem remains robust across Web and Android.

## 1. The "Sacred Symbols" Rule
Core architectural files are the "bedrock" of the platform. If these are missing or broken, the entire Android ecosystem fails.
*   **Bedrock Files**: `UserDao.kt`, `FavoriteArtist.kt`, `UserProgress.kt`, `AppDatabase.kt`, `FestivalConfig.kt`.
*   **Protocol**: Never delete or move these files during a refactor without an immediate, verified re-implementation.
*   **Verification**: Run `ls android/app/src/main/java/com/example/szigerinsider2026/data/local/` before any build to ensure the DAOs and Entities exist.

## 2. Structural Hygiene (Zero-Brace-Drift)
Large Kotlin/Compose files are prone to "replacement corruption" where braces are mismatched or code is accidentally moved outside of function scopes.
*   **The Check**: Before submitting a code change, verify that the primary `fun` or `class` is correctly closed and that no stray blocks (like `Row` or `Column`) exist in the top-level scope.
*   **Refactor Policy**: If a UI file exceeds 500 lines and starts showing syntax errors during incremental updates, **do not patch it.** Rewrite the entire file or break it into sub-composables to reset the structural integrity.

## 3. The "One Name" Standard (Model Alignment)
Property drift between Web (TypeScript) and Android (Kotlin) is a major cause of "Unresolved Reference" errors.
*   **The Standard**: Always use `name` for the artist's display name (not `artist`).
*   **The Standard**: Always use `id` as the unique identifier across all models and JSON files.
*   **Protocol**: When updating a data class in `Artist.kt`, immediately check if the corresponding TypeScript interface in `src/types/` needs an update to maintain parity.

## 4. Rapid Diagnostic Workflow
Do not wait for a full APK "Assembly" to find a simple syntax error.
*   **Surgical Compile**: Use `./gradlew compile<Flavor>DebugKotlin` to check syntax. It is significantly faster than `assemble`.
*   **Parity Audit**: Features added to the Web (e.g., "Festival Wins") must have a corresponding "Stub" or Placeholder screen in Android immediately to prevent `Navigation.kt` from breaking.

## 5. Automated Health Checks
The `scripts/pulse-check.mjs` is the ecosystem gatekeeper.
*   **Requirement**: Any new festival added to the `festivals/` directory MUST pass a `npm run pulse-check` before any build attempt.
*   **Expansion**: The Pulse Check should be periodically updated to verify the presence of core Android source files and the integrity of the `public/data` sync.

## 6. Monolithic Routing
Never hardcode festival-specific logic into the `main` source sets.
*   **Web**: Use `useFestivalData()` and dynamic `/[festivalId]` routes.
*   **Android**: Use `FestivalConfig.current` and Gradle Flavors to handle branding and feature flags.
