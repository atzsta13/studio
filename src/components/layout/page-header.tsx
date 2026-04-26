'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/brutalist';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  festivalId?: string;
  icon?: LucideIcon;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  className 
}: PageHeaderProps) {
  return (
    <GlassCard className={cn("p-10 mb-12 relative overflow-hidden group border-primary/10", className)} blur="xl">
      <div className="absolute right-[-40px] top-[-40px] opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">
        {Icon && <Icon size={240} />}
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
        {Icon && (
          <div className="bg-primary p-6 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 shrink-0">
            <Icon size={44} strokeWidth={2.5} />
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8] mb-4">
            {title}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground leading-tight italic opacity-70 max-w-3xl">
            {subtitle}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
