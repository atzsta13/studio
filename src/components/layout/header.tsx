'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b border-border/40 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/90 md:block transition-all shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center gap-2 group">
            < Music2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden font-bold sm:inline-block text-lg tracking-tight">
              Sziget <span className="text-primary">Insider</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground relative py-1",
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 w-full h-[2.5px] bg-primary rounded-t-full shadow-[0_0_12px_rgba(230,0,126,0.5)]" />
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
