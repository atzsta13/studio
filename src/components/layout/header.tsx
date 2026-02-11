'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="container flex h-16 items-center">
        <div className="mr-8 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center gap-2 group">
            <Music2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
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
                    "transition-colors hover:text-foreground/80 relative py-1",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 w-full h-[2px] bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          {/* Placeholder for potential future search/auth items */}
        </div>
      </div>
    </header>
  );
}
