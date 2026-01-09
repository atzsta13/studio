'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur-sm md:block">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group mr-8">
          <Music2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-foreground text-lg tracking-tighter">
            Sziget <span className="text-primary">Insider</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-6 text-sm">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive ? "text-foreground font-semibold" : "text-foreground/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end"></div>

      </div>
    </header>
  );
}
