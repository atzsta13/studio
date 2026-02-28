---
description: Perform a health check of Data and Data Integrity.
---

# Feature & Data Audit Workflow

This workflow ensures that the application respects the Offline-First rules and data integrity constraints.

1. **Verify No Live Imports**:
Run `grep_search` across `src/` to verify no `fetch()` methods or third-party live REST API patterns are being introduced out-of-bounds (except Genkit proxy endpoints and Spotify Auth). 
```bash
grep -nr "fetch(" src/
```

2. **Verify JSON Integrity**:
Check `src/data/*.json`.
Make sure `lineup.json` and `lineup_2025.json` share standard data structures. 

// turbo
3. **Compile Code Verification**:
```bash
npm run type-check
```
