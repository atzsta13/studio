'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell, Heart, TrendingDown } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';
import { useToast } from '@/hooks/use-toast';

const MOCK_MERCH = [
  { id: '1', name: 'Official 2026 Hoodie', price: 18000, category: 'Apparel', img: 'https://media.appmiral.com/prod/performance/0056/95/thumb_5594558_performance_1440.jpeg' },
  { id: '2', name: 'Insider OLED Tee', price: 9500, category: 'Apparel', img: 'https://media.appmiral.com/prod/performance/0057/08/thumb_5607360_performance_1440.jpeg' },
  { id: '3', name: 'Survival Bucket Hat', price: 6000, category: 'Accessory', img: 'https://media.appmiral.com/prod/performance/0057/10/thumb_5609665_performance_1080.jpeg' },
  { id: '4', name: 'Brutalist Tote Bag', price: 4500, category: 'Accessory', img: 'https://media.appmiral.com/prod/performance/0056/95/thumb_5594558_performance_1440.jpeg' },
];

export default function MerchPage() {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const toggleWatch = (id: string) => {
    if (watchlist.includes(id)) {
      setWatchlist(watchlist.filter(i => i !== id));
    } else {
      setWatchlist([...watchlist, id]);
      toast({
        title: "PRICE WATCH ACTIVE",
        description: "We will notify you if this item goes on sale.",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-20 pb-32">
      <PageHeader 
        title="Merch Catalog" 
        description={`Secure the exclusive ${FESTIVAL.dates.year} collection. Check availability before you queue.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
        {MOCK_MERCH.map(item => (
          <Card key={item.id} className="bg-card/50 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl">
             <div className="relative aspect-[4/5] overflow-hidden">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute top-4 right-4">
                   <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => toggleWatch(item.id)}
                    className={`rounded-full shadow-2xl ${watchlist.includes(item.id) ? 'bg-primary text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                   >
                      <Bell size={18} className={watchlist.includes(item.id) ? 'animate-bounce' : ''} />
                   </Button>
                </div>
                {FESTIVAL.features.merchPriceWatch && watchlist.includes(item.id) && (
                  <div className="absolute bottom-4 left-4 right-4">
                     <Badge className="w-full justify-center bg-emerald-500 text-black font-black uppercase tracking-widest text-[8px] py-2 rounded-xl">
                        <TrendingDown size={12} className="mr-2" /> Price Watch Active
                     </Badge>
                  </div>
                )}
             </div>
             <CardContent className="p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">{item.category}</p>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 leading-tight">{item.name}</h3>
                <div className="flex items-center justify-between">
                   <p className="text-2xl font-black italic">{FESTIVAL.currency.localCode} {item.price.toLocaleString()}</p>
                   <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest border-white/10 hover:bg-white/5">Details</Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-20 bg-indigo-600 border-none shadow-2xl rounded-[3.5rem] p-12 text-white relative overflow-hidden">
         <div className="absolute right-[-40px] top-[-40px] opacity-20 rotate-12">
            <ShoppingBag size={240} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6">Skip the Queue</h2>
            <p className="text-xl font-medium opacity-90 italic mb-10 leading-relaxed">
               Select your items, pay via the {FESTIVAL.name} app, and collect at the Priority Lane in the Main Merch Tent.
            </p>
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100 font-black uppercase tracking-[0.3em] h-16 px-10 rounded-2xl">
               Pre-Order Now
            </Button>
         </div>
      </Card>
    </div>
  );
}
