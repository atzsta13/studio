# 🤖 Multi-Agent Parallel Workflow

This document outlines the architecture and strategy for allowing multiple Autonomous AI Agents (LLMs) to work on the Festival Insider Platform simultaneously without causing merge conflicts, race conditions, or logic fragmentation.

## The Strategy: "Domain-Isolated Branching"

Having two agents work on the exact same file in the exact same terminal session is dangerous (race conditions, file lock errors). The safest, most scalable way to implement parallel LLM development is utilizing Git workflows combined with strict domain boundaries.

### 1. The Setup (The Orchestrator)
You act as the Orchestrator. When you have a large feature spanning the whole stack, you assign domains to specific agents.

*   **Agent Alpha (e.g., Claude):** Assigned strictly to the `android/` directory.
*   **Agent Beta (e.g., Gemini):** Assigned strictly to the `src/` (Web) directory.

### 2. The Execution (Git Flow)

**Step A: Branching**
Each agent operates in its own isolated Git branch, branching off `main`.
```bash
# Agent Alpha (Android) runs:
git checkout -b feature/android-offline-map

# Agent Beta (Web) runs:
git checkout -b feature/web-interactive-map
```

**Step B: Parallel Development**
Both agents execute their tasks independently. Because they are constrained to different directories (`android/` vs `src/`), there is a **0% chance of file collision**.

**Step C: The Handshake (PR & Merge)**
Once an agent finishes, it commits and pushes its branch (or submits a patch). 
```bash
git commit -m "feat(android): implement offline map caching"
```
A reviewing agent (or you) runs `git diff main` to verify the logic, ensures compilation (`./gradlew assembleDebug` or `npm run build`), and merges it back into `main`.

## Advanced Parallelism: Same Domain, Different Files

If two agents must work in the same domain (e.g., both building React components in `src/`), use the **Interface-First Contract**:

1.  **Define the Interface:** Agree on a TypeScript interface or JSON schema first.
2.  **Agent A:** Builds the UI Component (e.g., `ScheduleGrid.tsx`) using mocked data matching the interface.
3.  **Agent B:** Builds the Data Hook / API (e.g., `useSchedule.ts`) that fetches and formats data to match the interface.
4.  **Merge:** Because they adhered to the same contract, combining them is seamless.

## Frameworks for Concurrent Agents

If you want to automate this so agents talk to *each other* and divide work programmatically, you should leverage the **Google Genkit** framework already installed in this repository (`src/ai/genkit.ts`).

You can define multiple Genkit agents with specific toolsets:
- `AndroidArchitectFlow` (Only has tools to run `./gradlew` and edit `.kt` files).
- `WebEngineerFlow` (Only has tools to run `npm` and edit `.tsx` files).
- `OrchestratorFlow` (Receives your prompt, splits it into Web and Android tasks, and calls the other two flows concurrently via `Promise.all()`).

This turns the repository itself into a multi-agent factory.