'use server';
/**
 * @fileOverview AI Artist Recommendation Flow.
 * Matches user preferences against the festival lineup using Genkit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FESTIVAL, FESTIVAL_CONFIGS } from '@/config/festival-engine';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Data-shape types (strict, no `any`)
// ---------------------------------------------------------------------------

interface LineupArtist {
  id: string;
  artist: string;
  genres?: string[];
  vibes?: string[];
  description?: string;
  isHeadliner?: boolean;
  returningHero?: boolean;
  countryCode?: string;
}

interface PoiEntry {
  id: string;
  name: string;
  type: string;
}

interface PricingEntry {
  item: string;
  price: string;
}

interface SurvivalData {
  pricing?: {
    drinks?: PricingEntry[];
    food?: PricingEntry[];
  };
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const RecommendInputSchema = z.object({
  prompt: z.string().describe('The user\'s mood or musical preference (e.g., "I want something loud and heavy" or "chill afternoon vibes").'),
  festivalId: z.string().optional(),
  aiPersona: z.string().optional(),
  fullName: z.string().optional(),
  artists: z.array(z.any()).optional(),
  stages: z.string().optional().describe('Comma-separated list of stage names at this festival.'),
  prices: z.string().optional().describe('Short summary of typical food and drink prices at the festival.'),
});

const RecommendOutputSchema = z.object({
  recommendations: z.array(z.object({
    artistId: z.string(),
    reason: z.string().describe('A short, catchy explanation of why this artist matches the user\'s mood.'),
  })).max(5),
  scoutMessage: z.string().describe('A short, hype-filled message from the Scout.'),
});

export type RecommendInput = z.infer<typeof RecommendInputSchema>;
export type RecommendOutput = z.infer<typeof RecommendOutputSchema>;

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const recommendPrompt = ai.definePrompt({
  name: 'recommendArtists',
  input: { schema: RecommendInputSchema },
  output: { schema: RecommendOutputSchema },
  prompt: `You are {{aiPersona}}.

{{#if stages}}Stages at this festival: {{stages}}
{{/if}}
{{#if prices}}Typical prices: {{prices}}
{{/if}}
Below is the official lineup for {{fullName}}:
{{#each artists}}
- ID: {{this.id}}, Artist: {{this.artist}}{{#if this.isHeadliner}} [HEADLINER]{{/if}}{{#if this.returningHero}} [RETURNING HERO]{{/if}}, Country: {{this.countryCode}}, Genres: {{this.genres}}, Vibes: {{this.vibes}}, Bio: {{this.description}}
{{/each}}

USER MOOD: "{{{prompt}}}"

Your task:
1. Pick the 3 to 5 best artists from the lineup that match the user's mood.
2. Aim for a mix of headliners and hidden gems — don't only recommend the biggest names.
3. For each artist, write a very short, punchy reason why they should see them. When relevant, mention the stage name and any festival context (e.g. prices, atmosphere).
4. Write a global "Scout Message" that is energetic and welcoming.

If the user's prompt is too vague, pick high-energy headliners. Stay in character as a cool festival guide.`,
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function recommendArtists(input: RecommendInput): Promise<RecommendOutput> {
  const result = await recommendArtistsFlow(input);
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load festival-specific lineup data.
 * Reads from the festivals/ source directory; falls back to synced src/data/.
 */
function getFestivalLineup(festivalId: string): Promise<LineupArtist[]> | LineupArtist[] {
  try {
    const dataPath = path.join(process.cwd(), 'festivals', festivalId, 'data', 'lineup.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as LineupArtist[];
    }
  } catch (e) {
    console.error(`Failed to load lineup for ${festivalId}`, e);
  }
  // Fallback to currently synced lineup
  return import('@/data/lineup.json').then(m => m.default as unknown as LineupArtist[]);
}

/**
 * Load POI data and return a comma-separated list of stage names.
 * Returns undefined if the file is missing or unreadable.
 */
function getFestivalStages(festivalId: string): string | undefined {
  try {
    const dataPath = path.join(process.cwd(), 'festivals', festivalId, 'data', 'poi.json');
    if (fs.existsSync(dataPath)) {
      const entries = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as PoiEntry[];
      const names = entries
        .filter(e => e.type === 'stage')
        .map(e => e.name);
      return names.length > 0 ? names.join(', ') : undefined;
    }
  } catch (e) {
    console.error(`Failed to load POI for ${festivalId}`, e);
  }
  return undefined;
}

/**
 * Load survival.json and return a short prices summary string.
 * Returns undefined if the file is missing or unreadable.
 */
function getFestivalPrices(festivalId: string): string | undefined {
  try {
    const dataPath = path.join(process.cwd(), 'festivals', festivalId, 'data', 'survival.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as SurvivalData;
      const parts: string[] = [];
      for (const entry of data.pricing?.drinks ?? []) {
        parts.push(`${entry.item}: ${entry.price}`);
      }
      for (const entry of data.pricing?.food ?? []) {
        parts.push(`${entry.item}: ${entry.price}`);
      }
      return parts.length > 0 ? parts.join('; ') : undefined;
    }
  } catch (e) {
    console.error(`Failed to load survival data for ${festivalId}`, e);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Flow
// ---------------------------------------------------------------------------

const recommendArtistsFlow = ai.defineFlow(
  {
    name: 'recommendArtistsFlow',
    inputSchema: RecommendInputSchema,
    outputSchema: RecommendOutputSchema,
  },
  async (input) => {
    const targetId = input.festivalId || FESTIVAL.id;
    const config = FESTIVAL_CONFIGS[targetId as keyof typeof FESTIVAL_CONFIGS] || FESTIVAL;

    // Load all context in parallel
    const [lineup, stages, prices] = await Promise.all([
      getFestivalLineup(targetId),
      Promise.resolve(getFestivalStages(targetId)),
      Promise.resolve(getFestivalPrices(targetId)),
    ]);

    const { output } = await recommendPrompt({
      ...input,
      aiPersona: config.aiPersona,
      fullName: config.fullName,
      stages,
      prices,
      artists: (lineup as LineupArtist[]).map(a => ({
        id: a.id,
        artist: a.artist,
        genres: a.genres?.join(', ') ?? '',
        vibes: a.vibes?.join(', ') ?? '',
        description: a.description ?? '',
        isHeadliner: a.isHeadliner ?? false,
        returningHero: a.returningHero ?? false,
        countryCode: a.countryCode ?? '',
      })),
    });
    return output!;
  }
);
