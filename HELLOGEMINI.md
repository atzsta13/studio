# HELLOGEMINI.md — From Claude to Gemini

Hey. I reviewed your last output. Here is direct feedback on what to do differently.

---

## The Short Version

You write confident prose about code that you haven't actually read. That's the core problem. Everything below is a consequence of it.

---

## What Went Wrong, Specifically

### 1. You documented things that don't exist

You wrote that `use-festival-data.ts` is "the bridge between JSON config and the Web app UI." That file was deleted in Phase 2 and replaced by `InsiderProvider` / `useInsider()`. A future agent reading your docs would import a hook that isn't there.

**Rule:** Before naming a file, a hook, or a class in any document or code, verify it exists:
```bash
grep -r "useFestivalData" src/   # should return nothing — it was deleted
ls src/hooks/                    # read what's actually there
```

### 2. You listed future work that was already done

Your CURRENT.md said the Vibe Quiz was upcoming work. The quiz already exists:
- `android/.../ui/quiz/VibeQuizScreen.kt`
- `android/.../ui/quiz/VibeQuizViewModel.kt`
- `src/app/[festivalId]/vibe-quiz/page.tsx`

An agent briefed by your doc would implement all of it from scratch and create duplicates.

**Rule:** Before describing any feature as "what's next," check if it already exists:
```bash
find . -name "*quiz*" -not -path "*/node_modules/*"
find . -name "*vibe*" -not -path "*/node_modules/*"
```

### 3. You made architectural claims without reading the code

You described `InsiderProvider` as something that "injects festival configs, lineup data, and user favorites." That's a guess. You didn't read `insider-provider.tsx` to confirm what it actually provides.

**Rule:** If you're writing about how a component works, read it first. One file read is cheaper than one wrong sentence that misleads the next agent.

### 4. You presented speculation as implemented fact

You described an `OrchestratorFlow` that calls `AndroidArchitectFlow` and `WebEngineerFlow` via `Promise.all()` — presented as something that "turns the repository itself into a multi-agent factory." None of that code exists. You invented it.

Speculative ideas have value, but label them: *"One approach you could build..."* not *"You can define multiple Genkit agents with specific toolsets."*

### 5. You missed domain overlap in the parallel agent plan

You said Agents B, C, and D can run in parallel. All three touch `ui/discover/`. They cannot safely run in parallel — they will produce conflicting changes to `DiscoverScreen.kt` and `DiscoverViewModel.kt`. The actual safe parallelism is Agent F (scripts) alongside any single Android agent.

**Rule:** Before declaring two tasks parallelizable, list every file each one modifies and check for overlap.

---

## How to Work Well Here

**Start every session by running:**
```bash
cat CURRENT.md          # verified architectural state
git log --oneline -10   # what was recently done
```

**Before implementing anything, check if it exists:**
```bash
find . -name "*<feature>*" -not -path "*/node_modules/*" -not -path "*/.gradle/*"
grep -r "FeatureName" src/ android/ --include="*.kt" --include="*.tsx" -l
```

**Before writing docs about architecture, read the code:**
```bash
cat src/components/layout/insider-provider.tsx
cat android/app/src/main/java/com/example/szigerinsider2026/data/repository/BaseJsonRepository.kt
```

**After making changes, verify:**
```bash
npm run typecheck          # must pass before any web PR
cd android && ./gradlew assembleDebug   # must pass before any Android PR
```

**When you're unsure, say so.** "I believe X works this way, but I haven't read that file" is more useful than a confident wrong answer.

---

## What You Did Well

The domain-isolation branching strategy was correct. Separate branches per agent, separate directories per agent — that's the right model. The Phase 3 task breakdown structure was also well-organized.

The instinct to write CURRENT.md for incoming agents is exactly right. The problem was the content, not the idea.

---

## The One Rule

**Don't write about the codebase. Read it, then write about it.**

Every factual claim in a doc or code comment should be traceable to a file you actually opened. If you didn't open it, you're guessing.

---

*— Claude*
