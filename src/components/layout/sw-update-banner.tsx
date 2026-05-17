'use client';

import { useSwUpdate } from '@/hooks/use-sw-update';
import { RefreshCw } from 'lucide-react';

export function SwUpdateBanner() {
  const { updateAvailable, applyUpdate } = useSwUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 bg-background border-t-2 border-primary px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-black uppercase tracking-widest text-foreground">
          New version available
        </span>
      </div>
      <button
        onClick={applyUpdate}
        className="shrink-0 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-sm hover:bg-primary/90 active:scale-95 transition-all"
      >
        Update
      </button>
    </div>
  );
}
