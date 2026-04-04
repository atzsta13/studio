'use server';
/**
 * @fileOverview AI Global Matchmaker Flow.
 * Matches a user's vibe against ALL festivals in the ecosystem.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FESTIVAL_IDS, FESTIVAL_CONFIGS } from '@/config/festival';
import fs from 'fs';
import path from 'path';

const MatchInputSchema = z.object({
  prompt: z.string().describe('The user\'s vibe, musical preferences, or ideal festival experience.'),
});

const MatchOutputSchema = z.object({
  festivalId: z.string().describe('The ID of the recommended festival.'),
  festivalName: z.string().describe('The name of the recommended festival.'),
  reason: z.string().describe('A compelling, hype-filled explanation of why this festival is their perfect match.'),
  topArtists: z.array(z.object({
    artistId: z.string(),
    artistName: z.string(),
    reason: z.string().describe('Why they should see this specific artist.'),
  })).max(3),
});

export type MatchInput = z.infer<typeof MatchInputSchema>;
export type MatchOutput = z.infer<typeof MatchOutputSchema>;

function loadAllFestivalsData() {
  return FESTIVAL_IDS.map(id => {
    const config = FESTIVAL_CONFIGS[id as keyof typeof FESTIVAL_CONFIGS];
    let artists = [];
    try {
      const dataPath = path.join(process.cwd(), 'festivals', id, 'data', 'lineup.json');
      if (fs.existsSync(dataPath)) {
        const fullLineup = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        // Take top 30 artists to fit in context window and avoid token explosion
        artists = fullLineup.slice(0, 30).map((a: any) => ({
          id: a.id,
          artist: a.artist,
          genres: a.genres?.join(', ') ?? '',
        }));
      }
    } catch (e) {
      console.error(`Failed to load lineup for ${id} in Global Match`, e);
    }

    return {
      id,
      name: config.name,
      tagline: config.tagline,
      location: `${config.location.city}, ${config.location.country}`,
      artists,
    };
  });
}

const matchPrompt = ai.definePrompt({
  name: 'globalMatch',
  input: { schema: MatchInputSchema.extend({ festivals: z.array(z.any()) }) },
  output: { schema: MatchOutputSchema },
  prompt: `You are the "Global Vibe Scout", an elite AI that matches music fans with their perfect European summer festival.

  Here are the available festivals in our ecosystem and a sample of their lineups:
  {{#each festivals}}
  === FESTIVAL: {{this.name}} (ID: {{this.id}}) ===
  Location: {{this.location}}
  Vibe/Tagline: {{this.tagline}}
  Sample Artists:
  {{#each this.artists}}
    - ID: {{this.id}}, Name: {{this.artist}}, Genres: {{this.genres}}
  {{/each}}
  {{/each}}

  USER VIBE: "{{{prompt}}}"

  Your task:
  1. Analyze the user's vibe.
  2. Pick the SINGLE best festival from the list that matches their preferences.
  3. Provide a compelling reason why.
  4. Select the top 3 artists from THAT festival's sample lineup that they must see.
  
  Be energetic, confident, and persuasive. Assume the persona of an expert music journalist.`,
});

export async function matchGlobalFestival(input: MatchInput): Promise<MatchOutput> {
  const result = await globalMatchFlow(input);
  return result;
}

const globalMatchFlow = ai.defineFlow(
  {
    name: 'globalMatchFlow',
    inputSchema: MatchInputSchema,
    outputSchema: MatchOutputSchema,
  },
  async (input) => {
    const festivalsData = loadAllFestivalsData();

    const { output } = await matchPrompt({
      ...input,
      festivals: festivalsData,
    });
    
    return output!;
  }
);
