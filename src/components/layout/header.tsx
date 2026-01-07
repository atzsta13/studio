import Link from 'next/link';
import { Music2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 hidden w-full border-b bg-background/95 backdrop-blur-sm md:block">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Music2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">
            Sziget Insider 2026
          </span>
        </Link>
      </div>
    </header>
  );
}
