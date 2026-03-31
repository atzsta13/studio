'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { FESTIVAL } from '@/config/festival';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const DICTIONARY = [
  { term: 'Colosseum', def: 'A circular venue built from wooden pallets, the heart of Sziget techno.' },
  { term: 'Island Eye', def: 'The giant ferris wheel offering panoramic views of the entire festival.' },
  { term: 'Main Stage', def: 'The massive centerpiece where headliners perform each night.' },
  { term: 'Siesta', def: 'Taking a nap during the hottest hours (13:00 - 16:00) to survive the night.' },
  { term: 'Bridge of Freedom', def: 'The iconic K-bridge entry point to the island.' },
];

export default function DictionaryPage() {
  const [search, setSearch] = useState('');
  
  const filtered = DICTIONARY.filter(i => 
    i.term.toLowerCase().includes(search.toLowerCase()) || 
    i.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 pb-32">
      <PageHeader 
        title="Island Dictionary" 
        description={`Master the lingo of ${FESTIVAL.name}. Understand the secrets of the territory.`}
      />

      <div className="mt-12 relative mb-12">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
         <Input 
            placeholder="Search term..." 
            className="h-16 pl-16 rounded-2xl bg-card/50 border-white/5 font-bold" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((item, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-3xl border-white/5 rounded-3xl overflow-hidden hover:translate-x-2 transition-all">
             <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary mb-2">{item.term}</h3>
                <p className="text-lg font-medium text-muted-foreground italic leading-snug">{item.def}</p>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
