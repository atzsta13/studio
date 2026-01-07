'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Map, LifeBuoy, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/discover', label: 'Discover', icon: Wand2 },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/guide', label: 'Guide', icon: LifeBuoy },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const isActive = (pathname === '/' && item.href === '/') || (pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link href={item.href} key={item.href} className="flex flex-col items-center justify-center gap-1 text-xs">
              <item.icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
