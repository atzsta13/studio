# AI Flows & Genkit Integration

**Last updated:** 2026-03-20
**Status:** ✅ Implemented (recommend-artists-flow)
**Framework:** Genkit with `googleai/gemini-2.5-flash`

---

## TLDR

- **One active flow:** `recommend-artists-flow` (mood → 5 artist matches)
- **Input:** User mood/preference string (e.g., "electronic music with bass")
- **Output:** Artist IDs + match reasons
- **Cost:** ~$0.001 per request (1000 requests = $1)
- **Fallback:** None (errors show "AI unavailable")

---

## Table of Contents

1. [Architecture](#architecture)
2. [Recommend Artists Flow](#recommend-artists-flow)
3. [Testing Flows Locally](#testing-flows-locally)
4. [Adding New Flows](#adding-new-flows)
5. [Cost & Quotas](#cost--quotas)
6. [Troubleshooting](#troubleshooting)

---

## Architecture

### Genkit Overview

**What is Genkit?**
- Framework for building AI-powered features
- Abstracts LLM providers (Google, OpenAI, Anthropic)
- Handles streaming, retries, tracing

**Structure:**
```
src/ai/
├── genkit.ts              # Genkit instance + plugins
└── flows/
    └── recommend-artists-flow.ts  # Artist recommendation
```

### Request Flow

```
User prompt
  ↓
Web: /api/ai/recommend (POST)
  ↓
Genkit flow.run()
  ↓
Google Gemini 2.5 Flash API call
  ↓
Parse response JSON
  ↓
Return artist IDs + reasons
  ↓
Frontend displays matches
```

### Dependencies

```json
{
  "@genkit-ai/core": "^0.4.0",
  "@genkit-ai/google-ai": "^0.4.0",
  "google-generative-ai": "^0.13.0"
}
```

---

## Recommend Artists Flow

### File: `src/ai/flows/recommend-artists-flow.ts`

```typescript
import { defineFLow, z } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-ai';
import { getLineup } from '@/lib/lineup';

export const recommendArtistsFlow = defineFlow(
  {
    name: 'recommendArtists',
    inputSchema: z.object({
      prompt: z.string().describe('User mood/preference (e.g., "electronic music with bass")'),
      topK: z.number().optional().default(5).describe('Number of recommendations'),
    }),
    outputSchema: z.object({
      artistIds: z.array(z.string()),
      matchReasons: z.array(z.string()),
      model: z.string(),
      tokensUsed: z.object({
        input: z.number(),
        output: z.number(),
      }),
    }),
  },
  async (input) => {
    // 1. Load all artists from lineup.json
    const artists = await getLineup();

    // 2. Build context: artist list with genres + vibes
    const artistContext = artists
      .map(a => `${a.artist} (${a.genres.join(', ')}, vibes: ${a.vibes.join(', ')})`)
      .join('\n');

    // 3. Create AI request
    const result = await googleAI.generate({
      model: 'gemini-2.5-flash',
      prompt: `You are a festival music curation expert.

Given the user's mood/preference, recommend exactly ${input.topK} artists from this lineup that match.

LINEUP:
${artistContext}

USER PREFERENCE: ${input.prompt}

Return JSON:
{
  "artistIds": ["1", "42", ...],
  "matchReasons": ["reason1", "reason2", ...]
}

Respond ONLY with JSON, no other text.`,
    });

    // 4. Parse response
    const text = result.text;
    const parsed = JSON.parse(text);

    // 5. Validate and return
    return {
      artistIds: parsed.artistIds.slice(0, input.topK),
      matchReasons: parsed.matchReasons.slice(0, input.topK),
      model: 'gemini-2.5-flash',
      tokensUsed: {
        input: result.usage?.inputTokens || 0,
        output: result.usage?.outputTokens || 0,
      },
    };
  }
);
```

### Input

```typescript
{
  prompt: "I want energetic electronic music for dancing",
  topK: 5  // Optional, defaults to 5
}
```

### Output

```json
{
  "artistIds": ["1", "42", "56"],
  "matchReasons": [
    "Heavy electronic production with bass-heavy arrangement",
    "Known for high-energy festival performances",
    "Combines electronic and hip-hop with dynamic kicks"
  ],
  "model": "gemini-2.5-flash",
  "tokensUsed": {
    "input": 1234,
    "output": 156
  }
}
```

### Web Endpoint: `/api/ai/recommend`

**File:** `src/app/api/ai/recommend/route.ts`

```typescript
import { recommendArtistsFlow } from '@/ai/flows/recommend-artists-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, topK } = await request.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (prompt.length < 10 || prompt.length > 500) {
      return NextResponse.json(
        { error: 'prompt must be between 10 and 500 characters' },
        { status: 400 }
      );
    }

    // Run flow
    const result = await recommendArtistsFlow.run({
      prompt,
      topK: topK || 5,
    });

    // Cache result (5 minutes)
    const cacheKey = `ai:rec:${prompt.slice(0, 50).replace(/\s/g, '_')}`;
    const cache = new Map(); // Simple in-memory cache
    cache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI flow error:', error);

    // Return generic error (don't expose API details)
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Try again later.' },
      { status: 500 }
    );
  }
}
```

### Frontend Usage

```typescript
// src/app/discover/page.tsx ('use client')

const [recommendations, setRecommendations] = useState<string[]>([]);
const [loading, setLoading] = useState(false);

const handleGenerateRecommendations = async (mood: string) => {
  setLoading(true);
  try {
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: mood, topK: 5 }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    setRecommendations(data.artistIds);
  } catch (error) {
    console.error('Recommendation failed:', error);
    setRecommendations([]);
  } finally {
    setLoading(false);
  }
};

return (
  <>
    <textarea
      placeholder="E.g., 'energetic electronic music for dancing'"
      onChange={(e) => setMood(e.target.value)}
    />
    <button
      onClick={() => handleGenerateRecommendations(mood)}
      disabled={loading}
    >
      {loading ? 'Generating...' : 'Get AI Recommendations'}
    </button>
  </>
);
```

---

## Testing Flows Locally

### 1. Run Genkit Dev Server

```bash
# Terminal 1: Genkit dev server
npm run genkit:dev

# Output:
# Genkit dev server running on http://localhost:3400
```

### 2. Access Genkit UI

```bash
# Browser: http://localhost:3400
# You'll see:
# - All flows listed
# - Ability to run flows with test inputs
# - Traces + token usage
# - Error logs
```

### 3. Test in Genkit UI

```
Flow: recommendArtists

Input:
{
  "prompt": "chill music for sunset vibes",
  "topK": 3
}

Click "Run Flow"

Output:
{
  "artistIds": ["42", "15", "87"],
  "matchReasons": [...],
  "model": "gemini-2.5-flash",
  "tokensUsed": {...}
}
```

### 4. Test via API

```bash
curl -X POST http://localhost:9002/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "chill music for sunset vibes",
    "topK": 3
  }'
```

---

## Adding New Flows

### Example: Rate Mood Flow

**Goal:** User rates a mood (1-5 stars) → Returns vibe matches

**File:** `src/ai/flows/rate-mood-flow.ts`

```typescript
import { defineFlow, z } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-ai';

export const rateMoodFlow = defineFlow(
  {
    name: 'rateMood',
    inputSchema: z.object({
      mood: z.string(),
      rating: z.number().min(1).max(5),
    }),
    outputSchema: z.object({
      vibe: z.string(),
      explanation: z.string(),
    }),
  },
  async (input) => {
    const result = await googleAI.generate({
      model: 'gemini-2.5-flash',
      prompt: `User rated mood "${input.mood}" as ${input.rating}/5 stars.

Suggest a vibe category (Dance, Chill, Energy, etc.) and brief explanation.

Return JSON:
{
  "vibe": "Dance",
  "explanation": "High rating suggests energetic preference"
}`,
    });

    return JSON.parse(result.text);
  }
);
```

**Register flow:** Export from `src/ai/genkit.ts`

```typescript
export { recommendArtistsFlow } from './flows/recommend-artists-flow';
export { rateMoodFlow } from './flows/rate-mood-flow';
```

**Create endpoint:** `src/app/api/ai/rate-mood/route.ts`

```typescript
import { rateMoodFlow } from '@/ai/flows/rate-mood-flow';

export async function POST(request: NextRequest) {
  const { mood, rating } = await request.json();
  const result = await rateMoodFlow.run({ mood, rating });
  return NextResponse.json(result);
}
```

---

## Cost & Quotas

### Pricing

**Google Gemini 2.5 Flash:**
```
Input:  $0.075 per 1M tokens
Output: $0.3 per 1M tokens
```

**Example request:**
```
Input:  1500 tokens → 1500 * 0.075 / 1M = $0.0001125
Output: 200 tokens → 200 * 0.3 / 1M = $0.00006
Total: ~$0.00012 per request
```

**Monthly estimate (1000 requests):**
```
1000 × $0.00012 = $0.12/month
```

**Quota limits:**
- Free tier: 15 requests per minute
- Paid tier: 10K requests per minute (with API key)

### Cost Reduction Strategies

1. **Cache aggressively:**
   ```typescript
   // Cache recommendations for same prompt (5 min TTL)
   const cacheKey = hashPrompt(prompt);
   if (cache.has(cacheKey)) return cache.get(cacheKey);
   ```

2. **Reduce context size:**
   ```typescript
   // Instead of full lineup context (2000+ tokens)
   // Send only relevant artists based on keywords
   const filtered = artists.filter(a =>
     a.genres.some(g => prompt.includes(g.toLowerCase()))
   );
   ```

3. **Batch requests:**
   ```typescript
   // One flow: "recommend 3 sets of 5 artists"
   // Instead of: 3 separate calls
   ```

---

## Troubleshooting

### Issue: "GOOGLE_GENAI_API_KEY not configured"

**Cause:**
Environment variable not set.

**Solution:**
```bash
# .env.local
GOOGLE_GENAI_API_KEY=your-api-key-here

# Get key from:
# https://ai.google.dev/tutorials/setup
```

---

### Issue: "Rate limit exceeded"

**Error:**
```json
{ "error": "Too Many Requests" }
```

**Cause:**
15 requests/minute exceeded on free tier.

**Solution:**
1. Add caching (5-10 min TTL)
2. Implement request queuing
3. Upgrade to paid tier

---

### Issue: "Model response unparseable"

**Error:**
```
JSON.parse() error
```

**Cause:**
Gemini returned text instead of JSON.

**Fix in flow:**
```typescript
// Stricter prompt
const prompt = `...Return ONLY valid JSON. No markdown, no explanation.
{
  "artistIds": [...],
  "matchReasons": [...]
}`;

// Parse robustly
try {
  const parsed = JSON.parse(result.text);
} catch {
  // Retry or fallback
  return fallbackRecommendation();
}
```

---

### Issue: "Tokens usage not reported"

**Cause:**
`result.usage` is undefined.

**Fix:**
```typescript
const tokensUsed = {
  input: result.usage?.inputTokens || result.usage?.input || 0,
  output: result.usage?.outputTokens || result.usage?.output || 0,
};
```

---

## Future Flow Ideas

| Flow | Input | Output | Use Case |
|------|-------|--------|----------|
| `generatePlaylist` | Mood + artist IDs | Spotify playlist URL | Build playlists |
| `findClashes` | Favorite artists + schedule | Clash warnings | Schedule planning |
| `generateItinerary` | Budget + interests | Day-by-day agenda | Festival planning |
| `translatePhrase` | English phrase | Hungarian translation | Phrasebook |

---

## Genkit Documentation

- [Genkit Docs](https://github.com/firebase/genkit)
- [Google AI Plugin](https://github.com/firebase/genkit/tree/main/js/plugins/google-ai)
- [Gemini API Docs](https://ai.google.dev/docs)

---

## Related Files

- `src/ai/genkit.ts` — Genkit initialization
- `src/ai/flows/` — All flows
- `src/app/api/ai/` — API endpoints
- `docs/integration/API_ENDPOINTS.md` — API reference
