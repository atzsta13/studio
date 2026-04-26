# Multi-Agent Parallel Workflow

This document defines how to safely run multiple LLMs (Claude, Gemini, etc.) in parallel on this repository without conflicts.

---

## The Core Problem

If two agents edit the same file at the same time, one will overwrite the other's work. The solution is **domain isolation** — each agent owns a slice of the codebase and never crosses into another agent's territory.

---

## Method 1: Domain-Isolated Branches (Recommended)

This is the safest approach and works today with zero tooling changes.

### Step 1 — Divide Domains

Assign each agent a non-overlapping directory boundary before it starts:

| Agent | Domain | Branch name |
|---|---|---|
| Claude | `android/` | `feature/android-<task>` |
| Gemini | `src/` | `feature/web-<task>` |
| Either | `scripts/` | `feature/pipeline-<task>` |

`src/` and `android/` share zero files. Agents in different domains have a 0% file collision rate.

### Step 2 — Brief Each Agent

Every agent must start by reading `CURRENT.md` at the repo root. It contains the verified architectural state, the hook names, the repository patterns, and the exact verification commands. Without it, agents will implement things that already exist or use patterns that were replaced.

Tell each agent explicitly:
```
Read CURRENT.md first. You are working in the <domain> domain only.
Your task is described in docs/phases/PHASE_3_AGENT_MANIFEST.md under Agent <X>.
Do not touch files outside your domain.
```

### Step 3 — Parallel Execution

Both agents work simultaneously on their branches. No coordination needed mid-task because the domains are physically separated.

### Step 4 — Verification and Merge

When an agent finishes, run verification before merging:

```bash
# Web agent finished:
npm run typecheck && npm run build

# Android agent finished:
cd android && ./gradlew assembleDebug

# Then merge:
git checkout main
git merge feature/web-<task>
git merge feature/android-<task>
```

If both pass, both can be merged. The merge will be clean because no file was touched by both branches.

---

## Method 2: Same Domain, Different Files (Interface-First)

When two agents must both work in `src/` (e.g., one builds a component, one builds its data hook), prevent collision with a contract defined upfront.

**Before splitting work:**
1. Agree on a TypeScript interface in `src/types/index.ts` — this is the handshake.
2. Agent A builds the UI component using the interface with mocked data.
3. Agent B builds the data hook that returns data matching the interface.
4. Merge: because both sides conform to the same interface, combining them is mechanical.

This only works if the interface is locked before either agent starts. If Agent A diverges from the interface mid-task, Agent B's work breaks.

---

## Method 3: Sequential Review Loop

For high-risk changes (database migrations, config schema changes, shared utilities), use one agent to write and a second agent to verify:

1. Agent A implements the change and commits to a branch.
2. You open a new Claude or Gemini session, point it at the branch, and say: *"Read CURRENT.md, then run `npm run typecheck` and review the diff on this branch. List any issues."*
3. The reviewing agent either confirms or reports problems.
4. Merge only after the reviewer passes.

This is the human code review process but with LLMs — two independent reads of the same change catch more bugs than one.

---

## The Phase 3 Agent Manifest

`docs/phases/PHASE_3_AGENT_MANIFEST.md` is already written for parallel execution. Each Agent block (A through F) is scoped to specific files with zero overlap between blocks:

| Agent | Domain | Files touched |
|---|---|---|
| A | Android | `ui/map/MapScreen.kt` only |
| B | Android | `ui/quiz/` + `ui/navigation/` + `ui/home/` + `ui/discover/` |
| C | Android | `ui/discover/CountryExplorerSheet.kt` + Discover screen/VM + Artist screen |
| D | Android | `ui/discover/SerendipityScreen.kt` + `data/repository/LineupDiffRepository.kt` + home |
| E | Android | `ui/tools/SurvivalGuideScreen.kt` + Tools screen |
| F | Web/Node | `scripts/backfill-vibes.mjs` + JSON data files |

Agent F (pipeline) and any of A–E can run in parallel with zero risk. Agents B, C, D all touch `ui/discover/` — run only one of them at a time, or coordinate on a sub-file level.

---

## What Not to Do

- **Do not give two agents the same file to edit simultaneously.** Even on separate branches, you will hit merge conflicts.
- **Do not skip CURRENT.md.** Agents without context will reimplement `useFestivalData` (deleted), use Hilt (banned), or build features that already exist.
- **Do not let an agent run `./gradlew` during Phase 3 tasks.** Compilation verification is your job after the agent finishes, not during.
- **Do not merge an agent's branch without running typecheck or assembleDebug.** Agents make mistakes. The build gate catches them.
