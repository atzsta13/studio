'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { FESTIVAL } from '@/config/festival-engine';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function DictionaryPage() {
  const [search, setSearch] = useState('');
  const terms = FESTIVAL.content.dictionaryTerms;

  const filtered = terms.filter(i =>
    i.term.toLowerCase().includes(search.toLowerCase()) ||
    i.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 pb-32">
      <PageHeader title="Festival Dictionary"
        subtitle={`Master the lingo of ${FESTIVAL.name}. Understand the secrets of the territory.`}
      />

      {terms.length === 0 ? (
        <Card className="mt-12 bg-card/30 border-white/5 rounded-[3rem] p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground/60 italic">
            The dictionary for {FESTIVAL.name} has not been published yet.
          </p>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
