'use server';
/**
 * @fileOverview An artist recommendation AI agent.
 *
 * - recommendArtists - A function that handles the artist recommendation process.
 * - RecommendArtistsInput - The input type for the recommendArtists function.
 * - RecommendArtistsOutput - The return type for the recommendArtists function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';

const allArtists = lineup as LineupItem[];

const RecommendArtistsInputSchema = z.object({
  prompt: z
    .string()
    .describe('The user prompt describing their music taste or desired vibe.'),
});
export type RecommendArtistsInput = z.infer<
  typeof RecommendArtistsInputSchema
>;

const ArtistRecommendationSchema = z.object({
  artist: z.string().describe('The name of the recommended artist.'),
  reasoning: z
    .string()
    .describe('A short, compelling reason why the user might like this artist based on their prompt.'),
});

const RecommendArtistsOutputSchema = z.object({
  recommendations: z
    .array(ArtistRecommendationSchema)
    .describe('A list of 3-5 recommended artists.'),
});
export type RecommendArtistsOutput = z.infer<
  typeof RecommendArtistsOutputSchema
>;

export async function recommendArtists(
  input: RecommendArtistsInput
): Promise<RecommendArtistsOutput> {
  return recommendArtistsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'recommendArtistsPrompt',
  input: { schema: RecommendArtistsInputSchema },
  output: { schema: RecommendArtistsOutputSchema },
  prompt: `You are a music expert and a helpful festival guide for the Sziget Festival. Your goal is to help users discover new artists from the lineup based on their preferences.

You will be given a user's prompt describing the music or vibe they are looking for, and a list of all artists performing at the festival.

Analyze the user's prompt and the artist list, then recommend 3 to 5 artists that are a good match. For each recommendation, provide a short, exciting reason why the user would enjoy them.

USER PROMPT:
"{{{prompt}}}"

AVAILABLE ARTISTS (JSON):
${JSON.stringify(allArtists.map(a => ({ artist: a.artist, genres: a.genres, description: a.description })))}
`,
});

const recommendArtistsFlow = ai.defineFlow(
  {
    name: 'recommendArtistsFlow',
    inputSchema: RecommendArtistsInputSchema,
    outputSchema: RecommendArtistsOutputSchema,
  },
  async input => {
    const { output } = await recommendationPrompt(input);
    if (!output) {
      return { recommendations: [] };
    }
    return output;
  }
);
