# UI & Design System Guide

## Philosophy: Neon Brutalism

Festival Insider is a survival tool used in extreme festival conditions: direct sunlight, total darkness, loud crowds, and low battery. The design makes one deliberate trade-off — **readability and tap-ability over subtlety**.

Core principles:
- **OLED black everywhere** — saves battery, maximises contrast
- **Neon accents sparingly** — one or two per screen, never decorative
- **Touch targets are large** — minimum 48×48dp / 48×48px; most CTA buttons are full-width
- **Uppercase italic headlines** — fast to scan, high energy
- **No shadows** — use thin white borders (5–8% opacity) for depth instead

---

## Android Design System

### Color tokens (`ui/theme/Color.kt`)

```kotlin
// Backgrounds
val OLEDBlack       = Color(0xFF000000)  // All screen backgrounds
val CardBackground  = Color(0xFF111111)  // Cards, bottom nav, chips
val MutedBackground = Color(0xFF262626)  // Subtle dividers, empty states

// Neon accents
val PrimaryMagenta  = Color(0xFFFF0080)  // Favorites, Vibe Quiz, hearts
val ToxicGreen      = Color(0xFF4ADE80)  // Success, money, Survival Guide
val CyanPulse       = Color(0xFF00C3FF)  // Hydration, water, medical

// Text
val TextPrimary     = Color.White
val TextMuted       = Color(0xFFA0A0A0)  // ~63% white — labels, secondary info
```

**Rules:**
- Screen background is always `OLEDBlack`. Never use `CardBackground` as a background.
- Active/selected chip: `AcidYellow` background + `Color.Black` text.
- Unselected chip: `CardBackground` background + `TextPrimary` text.
- Cards use `border(1.dp, Color.White.copy(alpha = 0.06f), ...)` for subtle depth.

### Typography (`BrutalistTypography` in `ui/theme/Type.kt`)

```kotlin
// Headlines — always uppercase, black weight, italic
Text(
    text = "ISLAND RADAR",
    fontWeight = FontWeight.Black,
    fontStyle = FontStyle.Italic,
    letterSpacing = (-1).sp,
    lineHeight = 38.sp
)

// Overline / label — uppercase, wide tracking
Text(
    text = "TACTICAL NAVIGATION",
    fontSize = 11.sp,
    fontWeight = FontWeight.Bold,
    letterSpacing = 2.sp,
    color = TextMuted
)

// Body — legible, not styled
Text(
    text = artistBio,
    fontSize = 14.sp,
    lineHeight = 22.sp,
    color = TextMuted
)
```

### Shapes
- Cards: `RoundedCornerShape(16.dp)` to `RoundedCornerShape(20.dp)`
- Chips: `RoundedCornerShape(12.dp)`
- Bottom nav: `RoundedCornerShape(28.dp)`
- Circular elements (pins, avatars): `CircleShape`

### Haptics — required on all interactive elements

Use `rememberHapticManager()` from `ui/utils/HapticManager.kt`:

```kotlin
val haptic = rememberHapticManager()

// Use the appropriate intensity:
haptic.lightTap()       // Chip, nav tab, minor toggle, back button
haptic.mediumTap()      // Card tap, filter confirm, dialog open
haptic.favoriteTap()    // Star/heart toggle for artists
```

**If a composable has any `clickable {}` or button, it must have a haptic call.** No exceptions.

### Animation patterns

**State transitions:**
```kotlin
// Color state change (e.g., chip selection)
val bgColor by animateColorAsState(
    targetValue = if (selected) AcidYellow else CardBackground,
    animationSpec = tween(200)
)

// Show/hide sections
AnimatedVisibility(
    visible = isExpanded,
    enter = fadeIn(tween(200)) + expandVertically(tween(200)),
    exit = fadeOut(tween(150)) + shrinkVertically(tween(150))
)
```

**Infinite animations (use sparingly — only for "live" indicators):**
```kotlin
val infiniteTransition = rememberInfiniteTransition(label = "pulse")
val alpha by infiniteTransition.animateFloat(
    initialValue = 0.4f,
    targetValue = 1f,
    animationSpec = InfiniteRepeatableSpec(tween(800), RepeatMode.Reverse),
    label = "alpha"
)
```

### Checklist for new screens

- [ ] Background: `Modifier.background(OLEDBlack)`
- [ ] Headline: uppercase + `FontWeight.Black` + `FontStyle.Italic`
- [ ] All clickable elements call `haptic.*Tap()`
- [ ] Content padding bottom: `120.dp` minimum (clears the floating bottom nav)
- [ ] Cards use `CardBackground` + thin white border
- [ ] Active/selected states use `AcidYellow`
- [ ] Navigation back button with `Icons.AutoMirrored.Filled.ArrowBack`
- [ ] `LazyColumn`/`LazyVerticalGrid` for any list > 5 items

---

## Web Design System

### Color palette (Tailwind CSS 4 / CSS variables)

The primary/accent values below are the **default (Sziget) theme** — every festival overrides them via `festivals/<id>/config.json`, injected as CSS variables in `[festivalId]/layout.tsx`. Components must use the tokens (`bg-primary`, `text-primary`), never these raw values.

| Token | Default value | Usage |
|-------|-------|-------|
| Background | `hsl(240, 10%, 4%)` | All page backgrounds |
| Card | `hsl(240, 5%, 8%)` | Card surfaces |
| Muted | `hsl(240, 5%, 15%)` | Dividers, empty states |
| Primary (Magenta) | `#ff0080` | Primary action, favorites |
| Toxic Green | `#4ade80` | Success, money, budget |
| Cyan Pulse | `#00c3ff` | Hydration, medical |
| Text Primary | `#ffffff` | |
| Text Muted | `hsl(240, 5%, 65%)` | Descriptions, metadata |

### Typography rules (Tailwind classes)

```
Headlines:    font-black uppercase italic tracking-tighter
Overlines:    text-[10px] uppercase tracking-[0.2em] text-muted-foreground
Body:         text-base leading-relaxed
```

### Component conventions

**Cards:**
```
bg-card/50 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[2rem]
```

**Buttons:**
```
h-16 w-full rounded-[2rem]  ← minimum for CTA buttons
active:scale-95 transition-all duration-200  ← required interaction state
```

**Hover states:**
```
hover:scale-[1.02] hover:border-primary/50  ← on cards
group-hover:scale-110  ← on icons within a group wrapper
```

### Navigation

Bottom navigation is canonical for primary navigation on mobile — the `BottomNav` component is persistent across all mobile views. The sticky header exists only for the `FestivalSwitcher` dropdown and mode toggle, not for primary navigation.

### Checklist for new web pages

- [ ] Background: pitch/OLED black (`bg-background`)
- [ ] Headers: `uppercase italic font-black tracking-tighter`
- [ ] Interactive states: `active:scale-95` on any button or card
- [ ] Container padding: `py-12 pb-32` (clears bottom nav)
- [ ] Card style: `bg-card/50 backdrop-blur-3xl border border-white/5`
- [ ] Usable one-handed while holding a drink

---

## Cross-platform consistency

Both platforms share the same aesthetic vocabulary. When implementing a feature on one platform, the other should look recognisably similar:

| Concept | Web | Android |
|---------|-----|---------|
| Primary action | `#ff0080` (Magenta) | `PrimaryMagenta` |
| Selected state | Acid Yellow highlight | `AcidYellow` background |
| Card surface | `bg-card/50` | `CardBackground` |
| Screen background | `bg-background` | `OLEDBlack` |
| Body text | `text-muted-foreground` | `TextMuted` |
| Success | `#4ade80` | `ToxicGreen` |
| Water/hydration | `#00c3ff` | `CyanPulse` |
