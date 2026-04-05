'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { FESTIVAL } from '@/config/festival-engine';

export default function MerchPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-20 pb-32">
      <PageHeader
        title="Merch Catalog"
        description={`The official ${FESTIVAL.name} ${FESTIVAL.dates.year} collection.`}
      />

      <Card className="mt-20 bg-card/30 border-white/5 rounded-[3.5rem] p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <ShoppingBag size={400} />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60 mb-6">
            Coming Soon
          </p>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">
            Merch drops at the festival
          </h2>
          <p className="text-lg font-medium text-muted-foreground/60 italic leading-relaxed max-w-lg mx-auto">
            The {FESTIVAL.name} {FESTIVAL.dates.year} merch catalog will be available when the festival opens.
            Check back closer to {FESTIVAL.dates.startDate}.
          </p>
        </div>
      </Card>
    </div>
  );
}
