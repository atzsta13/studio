# 🤖 Multi-Agent Parallel Workflow

This document outlines the strategy for allowing multiple Autonomous AI Agents (LLMs) to work on the Festival Insider Platform simultaneously.

## The Core Problem: Domain Overlap

Multiple agents working on the same directory (or the same file) will cause merge conflicts and race conditions. 

**Example of Unsafe Parallelism:**
- Agent A: Adds "Country Filtering" to `DiscoverScreen.kt`.
- Agent B: Adds "Serendipity Mode" to `DiscoverScreen.kt`.
Result: Git merge conflict or lost code.

## The Strategy: "Directory-Isolated Development"

The safest way to implement parallel development is to assign agents to distinct, non-overlapping directories.

### 1. The Assignment (Orchestrator Role)
The human user acts as the Orchestrator. Tasks should be divided by physical folder boundaries.

*   **Safe Parallel Task A (Android):** Work inside `android/app/src/main/java/com/example/szigerinsider2026/ui/map/`
*   **Safe Parallel Task B (Web):** Work inside `src/app/[festivalId]/tools/`
*   **Safe Parallel Task C (Scripts):** Work inside `scripts/`

### 2. The Branching Workflow

**Step A: Isolation**
Each agent operates in its own Git branch.
```bash
# Agent Alpha (Android Task)
git checkout -b feature/android-map-fix

# Agent Beta (Web Task)
git checkout -b feature/web-survival-guide
```

**Step B: Verification**
Before merging, each agent MUST run the verification suite for its domain:
- **Web:** `npm run typecheck`
- **Android:** `cd android && ./gradlew assembleDebug`

**Step C: Merge**
Merge back to `main` one by one. If two tasks overlapped (violating isolation), the second agent is responsible for resolving conflicts.

## Speculative Future: Multi-Agent Automation

While not yet implemented, the platform uses **Google Genkit** (`src/ai/genkit.ts`). A future foundation task is to build an `OrchestratorFlow` that can programmatically divide tasks and call sub-agents concurrently. 

**DO NOT** assume this automation exists. Currently, all coordination is manual.

---
*Created: April 2026*
