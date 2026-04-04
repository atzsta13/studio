'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNavItems } from '@/config/nav';
import { ModeToggle } from './mode-toggle';
import { getFestivalConfig } from '@/config/festival';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';

export default function Header({ festivalId }: { festivalId?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const config = getFestivalConfig(festivalId);
  const navItems = getNavItems(festivalId);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 hidden w-full border-b border-border/10 bg-background/80 backdrop-blur-3xl md:block h-18" />
    );
  }

  const rootHref = festivalId ? `/${festivalId}` : '/';

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b border-border/10 bg-background/80 backdrop-blur-3xl md:block transition-all duration-500">
      <div className="container flex h-18 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href={rootHref} className="flex items-center gap-2.5 group">
            <div className="bg-primary/10 p-2 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/5 border border-primary/10">
              <Music2 className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden font-headline font-black text-2xl tracking-tighter sm:inline-block uppercase italic">
              {config.name} <span className="text-primary text-glow">Insider</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.25em]">
            {navItems.map((item) => {
              const isActive = item.href === rootHref ? pathname === rootHref : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-all duration-300 hover:text-primary relative py-1 px-2',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  >
                  {t(item.tKey)}
                  {isActive && (

                    <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary rounded-full shadow-[0_0_15px_rgba(255,0,128,0.6)] animate-in fade-in zoom-in duration-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
