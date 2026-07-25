## What this changes

<!-- One or two sentences. -->

## If this touches festival data

- [ ] I edited `festivals/<id>/` only — never `public/data/` or `android/app/src/main/assets/`
- [ ] I ran `npm run lineup:sync` and committed the synced output alongside the source
- [ ] Times are ISO 8601 with offset (`2026-08-20T21:45:00+02:00`), and post-midnight sets roll to the next date
- [ ] Every act I added appears on the festival's official published timetable

**Source I checked:** <!-- URL, or "photo of the board on site" -->

## If this touches code

- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] `npm test -- --run` green
- [ ] `cd android && ./gradlew test` green (if Android changed)

## Constraints

- [ ] No ticketing, payments, cashless, or entry scanning
- [ ] No ads, tracking, analytics, accounts, or camera
- [ ] No hardcoded festival names, colours, dates, or coordinates
- [ ] No re-hosted artist images or festival logos
