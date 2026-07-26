# Data Sources

Where every festival's schedule data comes from, and when it was last checked against the source.

This project is **unofficial**. All data is compiled from festivals' own public announcements. We are not the organiser and we can be wrong — when the official app disagrees with us, believe the official app. Corrections are welcome from anyone, including from the festivals themselves: open an issue.

## Per festival

| Festival | Source | Coverage | Last verified |
|---|---|---|---|
| `frequency-2026` | [frequency.at/en/timetable](https://www.frequency.at/en/timetable/) + [/en/lineup](https://www.frequency.at/en/lineup/) | 82/82 slots, 5 stages, Aug 20–22 | 2026-07-25 |
| `sziget-2026` | szigetfestival.com official programme | 431/451 acts scheduled, 18 stages, Aug 9–16 | 2026-07-26 |
| `novarock-2026` | novarock.at official timetable | 84/84 — verified line-by-line | 2026-06-12 |
| `area53-2026` | area53festival.at + official 2026 poster | 32/32 slots (29 distinct acts) | 2026-07-10 |
| `rock-am-ring-2026` | official timetable PDF, hand-authored | 73/73 | — |
| `ernte-punk-2026` | not yet published by the festival | TBA (`null` times) | — |

## Rules

**Times.** Every `startTime` / `endTime` is ISO 8601 with offset (`2026-08-20T23:45:00+02:00`), never bare `HH:mm`. Sets running past midnight roll to the next calendar date — Frequency's Nightstage runs to 05:30, so a Thursday-billed set can legitimately carry a Friday date. Festivals without a published schedule use `null` and set `features.timetable: false`.

**The lineup mirrors the timetable.** An act that is not on the official timetable does not belong in `lineup.json`. When Frequency published its timetable on 2026-07-25, two previously-scraped acts (Missio, t-low) were absent from both the timetable *and* the current lineup page — they had been dropped from the bill, so they were removed here too. Same precedent as Nova Rock in June 2026, where five never-announced acts were deleted.

**Artist images are never re-hosted.** Every image is hotlinked to its original CDN and displayed through the `ArtistImage` component, which renders a `© source.com` attribution watermark. If you own an image and want it gone, open an issue.

**Scraping is done gently.** `robots.txt` is respected, requests are rate-limited, and the MusicBrainz client sends an identifying User-Agent as their guidelines require. We are guests on other people's servers.

**Duplicate rows are a recurring scraper failure.** The Sziget feed emits the same set twice — once under the bare act name, once under its programme title (`"Mirror Talks: The New Era of Gender"`). 30 exact duplicates were removed on 2026-07-25 and 12 near-duplicates (same stage, same start, same image) on 2026-07-26. After any Sziget re-scrape, check for two acts sharing one stage+`startTime` before committing.

**No raw page dumps.** Scraped HTML is parsed into structured data and discarded. Verbatim copies of festival web pages are not committed — twelve such files (`lineup_2025_official.json`) were removed in `685f1a1` for exactly this reason.

## Verifying a festival yourself

```bash
# 1. edit the source of truth only
$EDITOR festivals/<id>/data/lineup.json

# 2. propagate to web + Android
npm run lineup:sync

# 3. commit source and synced outputs together
```

Never edit `public/data/` or `android/app/src/main/assets/<id>/` directly — `lineup:sync` overwrites both from `festivals/<id>/`.
