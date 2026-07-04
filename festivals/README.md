# festivals/ — SOURCE OF TRUTH for all festival data

Every festival lives in its own folder. This is the ONLY place festival data is edited — `public/data/` and `android/app/src/main/assets/` are generated copies.

```
festivals/
  festival-config.schema.json   ← JSON schema; every config.json is validated against it on sync
  <festival-id>/                ← e.g. sziget-2026
    config.json                 ← identity, theme colors, dates, feature flags, i18n, location
    data/
      lineup.json               ← artists (id, artist, genres, vibes, day, stage, startTime, endTime, showInSchedule…)
      food.json                 ← food vendors
      guide.json                ← survival guide content
      poi.json                  ← map points of interest
      lineup_2025.json          ← previous-year lineup (optional; powers the "lineup diff" feature)
      store_meta.json           ← app-store style metadata (optional)
    assets/                     ← map.svg etc. (optional)
```

Rules:
- `startTime`/`endTime` are ISO 8601 **with offset** (`"2026-08-14T16:00:00+02:00"`) or `null`. Never `"HH:mm"`.
- After any edit here, run `npm run lineup:sync` and commit the synced outputs together with your change.
- Feature flags in `config.json` gate UI on both platforms — see `docs/features/FEATURES.md` for which flags actually have UI.
