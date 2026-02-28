---
description: How to compile and successfully build Sziget Insider 2026.
---

# Deploy Workflow

This document explains the standard procedure to verify if the Next.js App Router complies cleanly into static HTML.

// turbo
1. Install / update dependencies:
```bash
npm install
```

// turbo
2. Build the app locally. Wait for it to confirm 0 errors regarding type mismatches or unescaped JSX logic.
```bash
npm run build
```

3. Ensure no live-data connections break the static page generation phase covering all `/artist/[id]` files.

4. Check `out` or the `.next` output and ensure the `getStaticParams` resolved seamlessly.
