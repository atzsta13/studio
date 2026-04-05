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

const RecommendInputSchema = z.object({
  prompt: z.string().describe('The user\'s mood or musical preference (e.g., "I want something loud and heavy" or "chill afternoon vibes").'),
  festivalId: z.string().optional(),
  aiPersona: z.string().optional(),
  fullName: z.string().optional(),
  artists: z.array(z.any()).optional(),
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

const recommendPrompt = ai.definePrompt({
  name: 'recommendArtists',
  input: { schema: RecommendInputSchema },
  output: { schema: RecommendOutputSchema },
  prompt: `You are {{aiPersona}}.
  
  Below is the official lineup for {{fullName}}:
  {{#each artists}}
  - ID: {{this.id}}, Artist: {{this.artist}}, Genres: {{this.genres}}, Vibes: {{this.vibes}}, Bio: {{this.description}}
  {{/each}}

  USER MOOD: "{{{prompt}}}"

  Your task:
  1. Pick the 3 to 5 best artists from the lineup that match the user's mood.
  2. For each, write a very short, punchy reason why they should see them.
  3. Write a global "Scout Message" that is energetic and welcoming.
  
  If the user's prompt is too vague, pick high-energy headliners. Stay in character as a cool festival guide.`,
});

export async function recommendArtists(input: RecommendInput): Promise<RecommendOutput> {
  const result = await recommendArtistsFlow(input);
  return result;
}

/**
 * Helper to load festival-specific lineup data for the AI flow.
 * On Vercel/Server, we read from the festivals/ directory.
 */
function getFestivalLineup(festivalId: string) {
  try {
    const dataPath = path.join(process.cwd(), 'festivals', festivalId, 'data', 'lineup.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) {
    console.error(`Failed to load lineup for ${festivalId}`, e);
  }
  // Fallback to currently synced lineup
  return import('@/data/lineup.json').then(m => m.default);
}

const recommendArtistsFlow = ai.defineFlow(
  {
    name: 'recommendArtistsFlow',
    inputSchema: RecommendInputSchema,
    outputSchema: RecommendOutputSchema,
  },
  async (input) => {
    const targetId = input.festivalId || FESTIVAL.id;
    const config = FESTIVAL_CONFIGS[targetId as keyof typeof FESTIVAL_CONFIGS] || FESTIVAL;
    
    // Load the correct lineup for this festival
    const lineup = await getFestivalLineup(targetId);

    const { output } = await recommendPrompt({
      ...input,
      aiPersona: config.aiPersona,
      fullName: config.fullName,
      artists: (lineup as Array<{ id: string; artist: string; genres?: string[]; vibes?: string[]; description?: string }>).map(a => ({
        id: a.id,
        artist: a.artist,
        genres: a.genres?.join(', ') ?? '',
        vibes: a.vibes?.join(', ') ?? '',
        description: a.description?.substring(0, 150) ?? '',
      }))
    });
    return output!;
  }
);
