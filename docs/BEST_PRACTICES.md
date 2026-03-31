# Development Best Practices

**Last updated:** 2026-03-31

These rules exist because we violated them. Each one maps to a real bug or cleanup session.

---

## 1. Never Use `any`

**Rule:** TypeScript strict mode means zero `any`. No exceptions outside ShadCN internals.

**What to do instead:**
- Define an interface for the shape you need.
- Use `unknown` + type guard if you genuinely don't know the shape at compile time.
- Use `as SpecificType` cast (not `as any`) when you know the type but TypeScript doesn't.

```typescript
// BAD
const artists = lineup as any[];
artists.map((a: any) => a.artist);

// GOOD
const artists = lineup as LineupItem[];
artists.map((a) => a.artist);  // a is LineupItem — no cast needed
```

**Run before committing:** `npm run typecheck` — it must pass with 0 errors.

---

## 2. White-Label First

**Rule:** No festival name, brand color, coordinate, or date may appear in any component or logic file. All of it lives in config.

**Web checklist:**
- Import `FESTIVAL` from `@/config/festival` — never hardcode `"Sziget"`, `"Colosseum"`, or any date.
- Festival-specific *text content* (shuttle routes, glossary terms, etc.) belongs in `festivals/<id>/config.json` under the `content` key, then in `FestivalConfig.content`.
- `localStorage` keys must be prefixed with `${FESTIVAL.id}` — not a hardcoded string.

**Android checklist:**
- Use `FestivalConfig` constants — never hardcode in Composables.
- Flavor-specific assets go in `src/<flavorName>/res/`, not in `main/`.

**The test:** Run `NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run dev`. If anything looks wrong (wrong name, broken layout, missing data), a white-label rule was violated.

---

## 3. No Fake Data in Components

**Rule:** Never ship placeholder/mock data that a user could see and mistake for real information.

This includes:
- Fake vote counts, fake temperatures, fake "Now Playing" times
- Hardcoded artist CDN images used as fan photos
- CSS animations with static numbers underneath (fake "live" weather radar)
- Fake news alerts or fake live updates

**What to do instead:**
- Use a proper empty/coming-soon state: `if (!data.length) return <EmptyState />`
- Gate on a feature flag: `{FESTIVAL.features.liveUpdates && <NewsBulletin />}`
- Annotate clearly in code: `// TODO: replace with real API when available`

**Why:** Fake data shown as real erodes trust and creates support confusion once real data exists.

---

## 4. Feature Flags for Unfinished Features

**Rule:** If a feature isn't ready for all festivals, gate it with `FESTIVAL.features.<flagName>`.

```typescript
// In FestivalConfig interface (src/config/festival.ts)
features: {
  liveUpdates: boolean;
  fanPhotos: boolean;
}

// In component
{FESTIVAL.features.liveUpdates && <NewsBulletin />}
```

**Never** show a coming-soon state for a feature that could be enabled for some festivals and disabled for others. Use the flag — then the component is fully real or fully hidden.

---

## 5. Respect the Data Model

**Rule:** `stage`, `startTime`, and `endTime` in `LineupItem` are always `null` until Sziget publishes the schedule. Do not build UI that assumes they exist.

```typescript
// BAD — crashes when stage is null
<p>{artist.stage}</p>  // renders "null"

// GOOD
{artist.stage && <p>{artist.stage}</p>}
```

When the schedule arrives: update `festivals/sziget-2026/data/lineup.json`, run `npm run lineup:sync`, and the timetable/clash detection features activate automatically.

---

## 6. SSR Safety

**Rule:** Never use `Math.random()`, `Date.now()`, `window`, `localStorage`, or `navigator` at the module or render level — only inside `useEffect` or behind an `isMounted` guard.

```typescript
// BAD — SSR/client mismatch (hydration error)
const question = questions[Math.random() * questions.length | 0];

// GOOD — deterministic, same result on server and client
const question = questions[artistName.length % questions.length];

// GOOD — browser-only in useEffect
const [value, setValue] = useState('');
useEffect(() => { setValue(localStorage.getItem('key') || ''); }, []);
```

---

## 7. JSX Structure Validation

**Rule:** Always run `npm run typecheck` after any significant JSX edit. Unclosed or mismatched JSX tags produce cryptic errors far from the actual problem.

**Danger zones:**
- Conditional rendering with `&&` inside complex nesting
- Copy-pasting a component block — you may paste a closing tag without the opener
- AI-generated code — LLMs frequently insert orphaned closing tags

**Habit:** After a large component edit, verify the tag structure mentally or with a formatter before saving.

---

## 8. Festival Config Changes

**Rule:** Any new field added to `FestivalConfig` in `src/config/festival.ts` must be added to **all** festival configs:
- `festivals/sziget-2026/config.json`
- `festivals/area53-2026/config.json`
- `festivals/novarock-2026/config.json`
- `festivals/frequency-2026/config.json`

Use empty/default values if a festival doesn't use the feature yet. TypeScript will catch missing required fields.

---

## 9. Android Schema Changes

**Rule:** Every change to a Room `@Entity` class requires incrementing `@Database(version = …)` in `AppDatabase.kt`. `fallbackToDestructiveMigration()` is enabled — this is intentional for MVP, but still increment the version.

**Forgetting this causes:** Silent data loss or a crash on devices that had the old schema.

---

## 10. Commit Hygiene

**Before any commit:**
```bash
npm run typecheck   # 0 errors required
npm run lint        # 0 errors required
npm test -- --run   # all tests passing
```

**Never skip hooks** (`--no-verify`). If a hook fails, fix the underlying issue.

**Commit messages:** Follow the existing pattern — `feat:`, `fix:`, `docs:`, `refactor:` prefixes.

---

## Quick Reference Checklist

Before opening a PR, verify:

- [ ] `npm run typecheck` passes with 0 errors
- [ ] No `any` types added
- [ ] No hardcoded festival names, dates, colors, or coordinates in components
- [ ] No fake/mock data visible to users
- [ ] New festival-specific content is in `festivals/*/config.json`, not the component
- [ ] New unfinished features are behind a `FESTIVAL.features.*` flag
- [ ] New `FestivalConfig` fields are added to all 4 festival configs
- [ ] No `Math.random()` / `Date.now()` / `localStorage` at render level
- [ ] `localStorage` keys use `${FESTIVAL.id}` prefix
- [ ] Android: Room version incremented if any entity changed

---

## Related Docs

- `CLAUDE.md` — architecture rules and commands
- `docs/KNOWN_ISSUES.md` — current open bugs and accepted tech debt
- `docs/UI_GUIDE.md` — visual/design standards
- `src/config/festival.ts` — `FestivalConfig` interface (source of truth for config shape)
