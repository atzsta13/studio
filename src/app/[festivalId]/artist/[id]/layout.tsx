import { FESTIVAL_CONFIGS } from '@/config/festival-engine';
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  const results: { festivalId: string; id: string }[] = [];
  for (const festivalId of Object.keys(FESTIVAL_CONFIGS)) {
    try {
      const lineupPath = path.join(process.cwd(), 'public', 'data', festivalId, 'lineup.json');
      const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8')) as { id: string }[];
      lineup.forEach((artist) => results.push({ festivalId, id: artist.id }));
    } catch {
      // festival has no lineup yet — skip
    }
  }
  return results;
}

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
