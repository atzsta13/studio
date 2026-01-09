import Link from 'next/link';
import { Music2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-[100] hidden w-full border-b border-white/5 bg-black/95 backdrop-blur-xl md:block">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Music2 className="h-5 w-5 text-pink-500 group-hover:scale-110 transition-transform" />
          <span className="font-black text-white text-lg tracking-tighter uppercase">
            Sziget <span className="text-pink-500">Insider</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
