# 🏷️ White-Label Playbook (New Festival Setup)

This guide explains how to launch a brand new festival app in the ecosystem using the existing engine. 

## ⏱️ Total Setup Time: 15 Minutes

### 1. Create the Festival Directory
```bash
mkdir -p festivals/[id]/data festivals/[id]/assets
```

### 2. Configure the "Brain" (`config.json`)
Copy a template from `festivals/sziget-2026/config.json` and modify:
- **`id`**: Must be unique (e.g., `tomorrowland-2026`).
- **`theme`**: Update primary/accent HEX and HSL colors.
- **`radarFocuses`**: Define the territories (e.g., "Main Stage", "Freedom Stage").
- **`features`**: Toggle the 50+ flags based on your contract.

### 3. Populate Source Data
Provide these four mandatory files in `festivals/[id]/data/`:
- **`lineup.json`**: Artist names, genres, and vibes.
- **`guide.json`**: Standardized Survival Guide sections.
- **`poi.json`**: Coordinate-mapped stages and utilities.
- **`food.json`**: Vendor list and budget flags.

### 4. Register in Web Hub
Add the new festival to `src/config/festival.ts`:
```typescript
import myfest from '../../festivals/myfest-id/config.json'
// ... add to FESTIVAL_CONFIGS object
```

### 5. Create Android Source Set
1.  Open `android/app/build.gradle.kts`.
2.  Add a new `productFlavor`:
    ```kotlin
    create("myfest") {
        applicationId = "com.myfest.insider"
        versionName = "1.0.0"
    }
    ```
3.  Sync assets:
    ```bash
    NEXT_PUBLIC_FESTIVAL_ID=myfest-id npm run android:sync:[flavor]
    ```

### 6. Verify & Deploy
- **Web**: `NEXT_PUBLIC_FESTIVAL_ID=[id] npm run dev`
- **Android**: `./gradlew assemble[Flavor]Debug`

---

## 🎨 Creative Guidelines
- **Icons**: Icons for Passport Stamps must match the keys in `src/app/passport/page.tsx` (e.g., `star`, `flame`, `utensils`).
- **Personas**: The `aiPersona` should be written in the second person ("You are the...") to ensure the AI adopts the correct tone for that specific brand.
