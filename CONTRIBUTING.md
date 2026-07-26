# Contributing to Open Festival Hub

Thanks for being here. This project exists because festivals too small to afford an app get nothing, and because a privacy promise you can't verify isn't worth much. Both of those get fixed by people showing up.

There is no CLA, no corporate sign-off, and no contributor agreement to read. Open a pull request.

---

## The main thing: add your festival

This is the contribution that matters most, and it needs **no code**. A festival in this app is a folder of JSON.

```bash
git clone https://github.com/openfestivalhub/openfestivalhub
cd openfestivalhub
npm install

# scaffold the folder structure
node scripts/add-festival.mjs
```

That creates `festivals/<your-festival-id>/`:

```
festivals/<id>/
├── config.json        # name, dates, location, colours, feature flags
└── data/
    ├── lineup.json    # the acts and their set times
    ├── poi.json       # map points of interest  (optional)
    ├── food.json      # food vendors            (optional)
    └── guide.json     # survival guide content  (optional)
```

Then:

```bash
npm run lineup:sync    # propagates to web + Android
npm test -- --run      # keep it green
```

Commit **both** the source in `festivals/<id>/` and the synced output. CI checks they match.

### What `lineup.json` looks like

```json
[
  {
    "id": "1",
    "artist": "Lorde",
    "stage": "Space Stage",
    "day": "Thursday",
    "startTime": "2026-08-20T21:45:00+02:00",
    "endTime": "2026-08-20T22:55:00+02:00",
    "countryCode": "NZ",
    "genres": [],
    "festivalUrl": "https://www.frequency.at/en/artist/lorde/",
    "socials": { "spotify": null },
    "description": null,
    "imageUrl": null,
    "vibes": []
  }
]
```

Only `id`, `artist`, `stage`, `day`, `startTime`, `endTime` are required. Everything else can be `null` or empty and the app degrades gracefully.

### Data rules that CI will enforce

1. **Times are ISO 8601 with offset.** `"2026-08-20T21:45:00+02:00"` — never bare `"21:45"`. If a set runs past midnight, roll the date: a Thursday-billed 04:30 set carries Friday's date.
2. **The lineup mirrors the official timetable.** If an act isn't on the festival's published running order, it doesn't go in `lineup.json`. No speculative or rumoured bookings.
3. **No schedule yet?** Use `null` times and set `features.timetable: false` in `config.json`.
4. **`day` must agree with `startTime` under a 06:00 rollover.** A 01:00 set belongs to the previous day's programme — label it Wednesday, not Thursday. CI computes this and fails on a mismatch.
5. **No duplicate rows for one slot.** Two acts sharing a stage and start time are fine (showcases do this), but if one act's name *contains* the other's, it's the same set scraped twice and CI rejects it.
6. **Config must validate** against `festivals/festival-config.schema.json`.
7. **Never edit `public/data/` or `android/app/src/main/assets/<id>/`.** They're generated — `lineup:sync` overwrites them. Edit `festivals/<id>/` only.

See [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) for how existing festivals were sourced, and cite your source in the PR.

---

## Fixing wrong data

A set time that's off by fifteen minutes is a real bug — it's the difference between catching a band and missing them. These are the most valuable small PRs in the project.

Edit `festivals/<id>/data/lineup.json`, run `npm run lineup:sync`, and say in the PR **where you checked** (official timetable page, the festival's app, a photo of the on-site board). Firsthand corrections from people actually at the festival are extremely welcome.

---

## Code contributions

```bash
npm run dev            # http://localhost:9002

# before every commit
npm run typecheck
npm run lint
npm test -- --run

cd android && ./gradlew test
```

Read [`AGENTS.md`](AGENTS.md) first — it's written for AI coding tools but it's the most accurate map of the codebase, and its task router points you at the right files.

### Things that will get a PR closed

These aren't style preferences, they're the reason the project exists:

- **Ticketing, payments, cashless top-up, or entry scanning.** Never. If it fails, someone is stranded at a gate. That belongs to the official app.
- **Ads, sponsored placement, paid tiers, or any monetisation.**
- **Accounts, logins, email, or phone collection.** The app is anonymous.
- **Analytics, telemetry, or any data leaving the device.**
- **Camera, QR scanning, or AR.**
- **Server-side anything.** The web build is a static export — a single `route.ts` breaks it.
- **Re-hosted artist images.** Always hotlink to the source CDN, always via the `ArtistImage` component so attribution renders.
- **Festival logos or official artwork.** We're unofficial and must not imply endorsement.
- **Hardcoded festival names, colours, dates, or coordinates** in components. Config-first: web reads `FESTIVAL` from `@/config/festival-engine`, Android reads `FestivalConfig`.

The full list lives in [`AGENTS.md`](AGENTS.md) under Hard Constraints.

---

## Licensing

By contributing you agree your work is licensed as:

- **Code** — [AGPL-3.0](LICENSE). Copyleft is deliberate: it's what stops someone shipping a closed fork with trackers and ads bolted on. Note this means the project cannot ship on Apple's App Store under this licence, which was an accepted trade-off.
- **Festival data** in `festivals/**` — [ODbL-1.0](LICENSE-DATA), so derived databases stay open.

---

## Reporting things

- **Wrong festival data** → issue, with your source
- **Bug** → issue, with device/browser and what you expected
- **Security** → see [`SECURITY.md`](SECURITY.md)
- **You own an image or trademark used here and want it removed** → open an issue and it will be removed, no argument

---

## Conduct

Be decent. Full text in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
