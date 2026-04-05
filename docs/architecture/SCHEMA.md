# 📊 Data Schema

This document defines the core data structures used across the Web and Android platforms.

## 🎵 Artist Object
The `Artist` object is the primary unit of the lineup.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique identifier (e.g., "dua-lipa") |
| `artist` | `String` | Display name of the artist |
| `stage` | `String?` | Stage name (e.g., "Main Stage") |
| `day` | `String?` | Day of the festival (e.g., "Wednesday") |
| `startTime` | `String?` | Format: "HH:mm" |
| `endTime` | `String?` | Format: "HH:mm" |
| `countryCode` | `String?` | ISO 3166-1 alpha-2 (e.g., "GB") |
| `genres` | `List<String>` | Array of genre tags |
| `vibes` | `List<String>` | Array of mood/vibe tags (e.g., "Energetic") |
| `imageUrl` | `String?` | Fully qualified URL to the artist photo |
| `isHeadliner` | `Boolean` | True if the artist is a Main Stage headliner |
| `socials` | `Socials?` | Nested object containing external links |

## 🔗 Socials Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `spotify` | `String?` | URL to Spotify artist page |
| `instagram` | `String?` | URL to Instagram profile |
| `youtube` | `String?` | URL to YouTube channel |
| `website` | `String?` | Official website URL |

## 📁 Source Files
- **Primary Source**: `src/data/lineup.json`
- **Android Target**: `android/app/src/main/assets/lineup.json`
