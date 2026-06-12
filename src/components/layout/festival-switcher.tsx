'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { FESTIVAL_CONFIGS, getFestivalConfig } from '@/config/festival-engine';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function FestivalSwitcher({ festivalId }: { festivalId: string }) {
  const router = useRouter();
  const current = getFestivalConfig(festivalId);
  const festivals = Object.values(FESTIVAL_CONFIGS);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 border border-white/5 hover:border-primary/20">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: current.theme.primaryHex }}
          />
          {current.name}
          <ChevronDown size={11} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-card border-white/10 min-w-[180px]">
        {festivals.map((fest) => (
          <DropdownMenuItem
            key={fest.id}
            onClick={() => router.push(`/${fest.id}`)}
            className={cn(
              'text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer flex items-center gap-2',
              fest.id === festivalId ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: fest.theme.primaryHex }}
            />
            {fest.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
