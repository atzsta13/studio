# Context Log & Iteration History

This file tracks major logic shifts to help LLMs maintain project context.

- **Iteration 1**: Initial scaffolding with Next.js 15.
- **Iteration 2**: Migration to **Next.js 16.1.6** and **Tailwind 4.0**.
- **Iteration 3**: Redesign of Artist Cards to remove redundant buttons and use a "Gallery" feel.
- **Iteration 4**: Implementation of the **Standout 25** feature set (AI Scout, Spotify Match, Quests, etc.).
- **Iteration 5**: Full Light/Dark mode implementation with `next-themes` and MUI 6 sync.
- **Iteration 6**: Comprehensive documentation overhaul for LLM context.

### Key Architectural Constraints:
- **No Cloud Database**: All user data MUST stay in `localStorage`.
- **Offline First**: All critical guides and maps MUST work without a network.
- **Latest Tech**: Always prefer the most recent stable versions of Next.js, React, and Tailwind.
