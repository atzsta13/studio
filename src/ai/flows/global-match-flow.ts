'use server';
/**
 * @fileOverview AI Global Matchmaker Flow.
 * Matches a user's vibe against ALL festivals in the ecosystem with deep context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FESTIVAL_IDS, FESTIVAL_CONFIGS } from '@/config/festival-engine';
import fs from 'fs';
import path from 'path';

const MatchInputSchema = z.object({
  prompt: z.string().describe('The user\'s vibe, musical preferences, or ideal festival experience.'),
});

const MatchOutputSchema = z.object({
  festivalId: z.string().describe('The ID of the recommended festival.'),
  festivalName: z.string().describe('The name of the recommended festival.'),
  vibeMatchPercentage: z.number().min(0).max(100).describe('A score from 0-100 indicating how perfect this match is.'),
  reason: z.string().describe('A compelling, hype-filled explanation of why this festival is their perfect match. Mention specific stages or slang if provided.'),
  suggestedStage: z.string().describe('The best stage or area (e.g. from Radar Focuses) for this user at this festival.').optional(),
  topArtists: z.array(z.object({
    artistId: z.string(),
    artistName: z.string(),
    reason: z.string().describe('Why they should see this specific artist, matching their vibe.'),
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
        // Pass all artists to leverage the massive 1M context window of Gemini 2.5 Flash
        artists = fullLineup.map((a: any) => ({
          id: a.id,
          artist: a.artist,
          genres: a.genres?.join(', ') ?? '',
          vibes: a.vibes?.join(', ') ?? '',
          stage: a.stage ?? 'TBA'
        }));
      }
    } catch (e) {
      console.error(`Failed to load lineup for ${id} in Global Match`, e);
    }

    return {
      id,
      name: config.name,
      tagline: config.tagline,
      location: `${config.location.venue} in ${config.location.city}, ${config.location.country}`,
      radarFocuses: config.content.radarFocuses?.map((f: any) => f.label).join(', ') ?? 'N/A',
      dictionary: config.content.dictionaryTerms?.map((t: any) => `${t.term}: ${t.def}`).join(' | ') ?? 'N/A',
      artists,
    };
  });
}

const matchPrompt = ai.definePrompt({
  name: 'globalMatch',
  input: { schema: MatchInputSchema.extend({ festivals: z.array(z.any()) }) },
  output: { schema: MatchOutputSchema },
  prompt: `You are the "Global Vibe Scout", an elite AI that matches music fans with their perfect European summer festival.

  Here are the available festivals in our ecosystem and their COMPLETE lineups:
  {{#each festivals}}
  === FESTIVAL: {{this.name}} (ID: {{this.id}}) ===
  Location: {{this.location}}
  Vibe/Tagline: {{this.tagline}}
  Key Stages/Territories: {{this.radarFocuses}}
  Local Slang/Terms: {{this.dictionary}}
  Lineup:
  {{#each this.artists}}
    - ID: {{this.id}}, Name: {{this.artist}}, Genres: {{this.genres}}, Vibes: {{this.vibes}}, Stage: {{this.stage}}
  {{/each}}
  {{/each}}

  USER VIBE REQUEST: "{{{prompt}}}"

  Your task:
  1. Analyze the user's vibe and musical taste deeply.
  2. Evaluate ALL festivals to find the ONE that has the highest density of matching artists and the right overall vibe.
  3. Provide a compelling reason why. Use the festival's specific stages (Radar Focuses) or local slang (Dictionary) in your pitch to prove you know the festival well.
  4. Select the top 3 artists from THAT festival's lineup that perfectly match the user.
  5. Provide a vibe match percentage (0-100).
  6. Suggest a specific stage or territory they should hang out at.
  
  Tone: Energetic, authoritative, insider knowledge. Talk like a seasoned festival veteran.`,
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
