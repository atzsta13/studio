'use client';
import { useInsider } from '@/components/layout/insider-provider';

import { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Loader2, LucideIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

interface FestivalLayoutShellProps {
  children: ReactNode;
  headerTitle: string;
  headerSubtitle: string;
  headerIcon?: LucideIcon;
}

export function FestivalLayoutShell({ 
  children, 
  headerTitle, 
  headerSubtitle, 
  headerIcon 
}: FestivalLayoutShellProps) {
  const { festivalId } = useParams() as { festivalId: string };
  const { config, isLoading } = useInsider();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Interface...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-white">
      <PageHeader 
        title={headerTitle} 
        subtitle={headerSubtitle} 
        festivalId={festivalId} 
        icon={headerIcon}
      />
      <main className="px-6 md:px-12 py-10 max-w-7xl mx-auto animate-in fade-in duration-1000">
        {children}
      </main>
    </div>
  );
}
