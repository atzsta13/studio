'use server';
/**
 * @fileOverview AI Artist Recommendation Flow.
 * Matches user preferences against the Sziget 2026 lineup using Genkit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import lineup from '@/data/lineup.json';

const RecommendInputSchema = z.object({
  prompt: z.string().describe('The user\'s mood or musical preference (e.g., "I want something loud and heavy" or "chill afternoon vibes").'),
});

const RecommendOutputSchema = z.object({
  recommendations: z.array(z.object({
    artistId: z.string(),
    reason: z.string().describe('A short, catchy explanation of why this artist matches the user\'s mood.'),
  })).max(5),
  scoutMessage: z.string().describe('A short, hype-filled message from the Sziget Scout.'),
});

export type RecommendInput = z.infer<typeof RecommendInputSchema>;
export type RecommendOutput = z.infer<typeof RecommendOutputSchema>;

const recommendPrompt = ai.definePrompt({
  name: 'recommendArtists',
  input: { schema: RecommendInputSchema },
  output: { schema: RecommendOutputSchema },
  prompt: `You are the "Sziget Insider Scout", a legendary festival veteran who knows every corner of the Island of Freedom.
  
  Below is the official lineup for Sziget 2026:
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

const recommendArtistsFlow = ai.defineFlow(
  {
    name: 'recommendArtistsFlow',
    inputSchema: RecommendInputSchema,
    outputSchema: RecommendOutputSchema,
  },
  async (input) => {
    // We pass a subset of data to avoid token limits if needed, 
    // but for 80 artists it should fit in a single prompt.
    const { output } = await recommendPrompt({
      ...input,
      artists: lineup.map(a => ({
        id: a.id,
        artist: a.artist,
        genres: a.genres?.join(', '),
        vibes: a.vibes?.join(', '),
        description: a.description?.substring(0, 150)
      }))
    });
    return output!;
  }
);
