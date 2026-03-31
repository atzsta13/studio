'use client';

import { WifiOff, AlertTriangle } from 'lucide-react';
import { useInsider } from '@/components/insider-provider';

export function OfflineBanner() {
  const { isOnline } = useInsider();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[3000] bg-orange-600 text-white px-6 py-3 flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
      <WifiOff size={20} className="animate-pulse" />
      <p className="text-[11px] font-black uppercase tracking-[0.2em]">
        OFFLINE MODE ACTIVE: All core features remain operational.
      </p>
      <AlertTriangle size={18} />
    </div>
  );
}
