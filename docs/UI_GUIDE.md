# UI & Design System Guide (Sziget Insider 2026)

## Philosophy: Neon Brutalism & Tactical OLED
Sziget Insider is a survival tool. It is designed to be used in the harshest festival conditions: blinding sunlight, complete darkness, mud, and dense crowds. The UI relies on high-contrast "OLED" modes, large touch targets, minimal borders, and vibrant neon accents to command attention.

## 1. Core Color Palette
- **Backgrounds**: 
  - Primary Base: `hsl(240, 10%, 4%)` (Deep OLED Black)
  - Cards/Overlays: `hsl(240, 5%, 8%)` with Tailwind's `backdrop-blur-3xl`
  - Subtle Muted: `hsl(240, 5%, 15%)`
- **Neon Accents** (Used for calls to action, active states, and glowing effects):
  - **Sziget Magenta**: `hsl(330, 100%, 50%)` -> Tailwind: `#ff0080` (Primary Action Color)
  - **Acid Yellow**: `#ffee00` (Warnings / Highlight Text / Stars)
  - **Toxic Green**: `#4ade80` (Success / Money / Budget)
  - **Cyan Pulse**: `#00c3ff` (Hydration / Medical Links)
- **Text & Typography Colors**:
  - Primary Text: Pure White (`#ffffff`) or `text-foreground`
  - Muted Text: `hsl(240, 5%, 65%)` (`text-muted-foreground`) used for descriptions, stages, and timestamps.

## 2. Typography Rules
- **Base Fonts**: Standard sans-serif system stack configured via Next/Google Fonts (`Inter`, `Outfit`, or `Varela Round`).
- **Styling Conventions**:
  - **Headlines (`h1`, `h2`, `CardTitle`)**: MUST be **uppercase, bold/black-weight, and italicized** (`font-black uppercase italic tracking-tighter`). This evokes speed, energy, and importance. Example: `Island Passport`.
  - **Overlines / Tiny Labels**: Use tiny text with massive letter spacing (`text-[10px] uppercase tracking-widest` or `tracking-[0.2em]`).
  - **Readability**: Body copy should be legible in the sun (`text-base leading-relaxed opacity-90`).

## 3. Form & Shape (Components)
- **Massive Tap Targets**:
  - In a festival pit, you cannot tap a 12px box. Buttons must be `h-16`, `h-20`, or massive width `w-full`. 
  - Borders should be highly rounded (`rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-full`) to look deeply native and smooth, minimizing jagged edges.
- **Glassmorphism & Depth**:
  - Almost every `<Card>` uses `shadow-2xl` and `bg-card/50 backdrop-blur-3xl border border-white/5`. 
  - Active states get a subtle colored glow (e.g., `shadow-primary/20 hover:border-primary/50`).
- **Micro-Animations**:
  - Use `group` utilities on parent wrappers heavily.
  - Standard interaction: `transition-all duration-500 hover:scale-[1.02] active:scale-95`.
  - On icons: `group-hover:scale-110`. Wait to see it bounce when tapped.

## 4. Layout Architecture
- **Ergonomics via Bottom Navigation**:
  - Top navigation bars are obsolete for heavy field use. 
  - `BottomNav` is persistent across all mobile views for effortless one-handed thumb interaction.
- **Grid Density**:
  - Give elements breathing room (`gap-6`, `gap-10`).
  - A dense layout should only be used in the Brutalist `Timetable` grid, where seeing conflicts requires strict structural rigidity.

## Summary Checklist for New Pages
- [ ] Is the background Pitch/OLED black?
- [ ] Are headers `uppercase italic font-black`?
- [ ] Are interactive states scaling (`active:scale-95`)?
- [ ] Is there proper whitespace (`container py-12 pb-32`)?
- [ ] Can it be navigated with one hand while holding a drink in the other?
