// scripts/infer-genres-ai.mjs
import fs from 'fs';
import path from 'path';
import { generate } from '@genkit-ai/ai';
import { gemini15Flash, googleAI } from '@genkit-ai/google-genai';
import { configureGenkit } from '@genkit-ai/core';

// Initialize Genkit
configureGenkit({
  plugins: [googleAI()],
  logLevel: 'info',
});

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'novarock-2026';
const lineupPath = path.join('festivals', festivalId, 'data', 'lineup.json');

if (!fs.existsSync(lineupPath)) {
  console.error(`lineup.json not found at ${lineupPath}`);
  process.exit(1);
}

const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8'));

async function inferGenres() {
  console.log(`🤖 Starting AI Genre Inference for ${festivalId}...`);
  let fixedCount = 0;

  for (let i = 0; i < lineup.length; i++) {
    const artist = lineup[i];
    
    // Condition: Has a bio, but genres are missing, TBA, or junk
    const hasBadGenres = !artist.genres || 
                         artist.genres.length === 0 || 
                         artist.genres.includes('TBA') || 
                         artist.genres.some(g => g.includes('TICKET') || g.includes(artist.artist.toUpperCase()));

    if (artist.description && artist.description.length > 50 && hasBadGenres) {
      console.log(`  🔍 Analyzing bio for: ${artist.artist}...`);
      
      try {
        const response = await generate({
          model: gemini15Flash,
          prompt: `Based on the following artist biography, provide exactly 1 to 3 musical genres for the artist "${artist.artist}". 
          Return ONLY a comma-separated list of genres in uppercase. 
          Example: TECHNO, DARK WAVE, INDUSTRIAL
          
          Bio: ${artist.description.substring(0, 1000)}`,
        });

        const inferred = response.text().split(',')
          .map(g => g.trim().toUpperCase())
          .filter(g => g.length > 0 && g !== 'TBA');

        if (inferred.length > 0) {
          artist.genres = inferred;
          fixedCount++;
          console.log(`  ✅ Fixed: ${artist.artist} -> ${inferred.join(', ')}`);
        }
      } catch (err) {
        console.error(`  ❌ AI Error for ${artist.artist}:`, err.message);
      }
      
      // Rate limiting safety
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (fixedCount > 0) {
    fs.writeFileSync(lineupPath, JSON.stringify(lineup, null, 2));
    console.log(`\n🎉 Success! AI fixed genres for ${fixedCount} artists in ${festivalId}.`);
  } else {
    console.log(`\nNo artists needed genre refinement in ${festivalId}.`);
  }
}

inferGenres();
