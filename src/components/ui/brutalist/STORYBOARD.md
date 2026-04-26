# 🎨 Brutalist UI Kit — Storyboard

This is the visual source of truth for the **Festival Insider** aesthetic. All components follow a high-contrast, "Neon-on-OLED" design language optimized for outdoor festival survival.

---

## 💎 Atomic Components

### 1. `NeonButton`
The primary interaction element. Standardizes heavy dropshadows and haptic feedback.
- **Variants:** `primary` (Magenta), `accent` (Acid Yellow), `secondary` (Cyan), `white`, `outline`.
- **Haptics:** Built-in success/medium/light patterns.
- **Usage:**
  ```tsx
  <NeonButton variant="accent" size="xl" onClick={handleAction}>
    ACTIVATE RADAR
  </NeonButton>
  ```

### 2. `GlassCard`
The standard container for all information panels.
- **Glassmorphism:** Uses `backdrop-blur-3xl` and semi-transparent backgrounds.
- **Variants:** `default` (zinc), `primary` (magenta-glow), `accent` (yellow-glow), `secondary` (cyan-glow).
- **Usage:**
  ```tsx
  <GlassCard variant="primary" p={6}>
    <p>Tactical Data Block</p>
  </GlassCard>
  ```

---

## 🏛️ Layout Patterns

### `PageHeader`
The universal entry point for every tactical screen.
- **Style:** Large italic headline with an oversized background ghost icon.
- **Usage:**
  ```tsx
  <PageHeader title="Map" subtitle="Island Radar" icon={MapIcon} />
  ```

### `FestivalLayoutShell`
The high-level wrapper that handles data loading and shared navigation.
- **Logic:** Injects `InsiderProvider` and handles "Initializing Interface" states.

---

## 🌈 Theme Palette
| Layer | Hex | CSS Variable |
|:---|:---|:---|
| Background | `#000000` | `var(--background)` |
| Primary | `#FF0080` | `var(--primary)` |
| Accent | `#FFEE00` | `var(--accent)` |
| Secondary | `#00C3FF` | `var(--secondary)` |
| Card | `#111111` | `var(--card)` |

---
*Created: April 2026*
