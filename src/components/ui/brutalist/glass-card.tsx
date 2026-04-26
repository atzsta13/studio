'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'accent' | 'secondary';
  hoverEffect?: boolean;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  hoverEffect = true,
  blur = 'xl',
  ...props
}: GlassCardProps) {
  
  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-3xl',
  };

  const variants = {
    default: 'bg-card/50 border-white/5',
    primary: 'bg-primary/5 border-primary/20',
    accent: 'bg-accent/5 border-accent/20',
    secondary: 'bg-secondary/5 border-secondary/20',
  };

  return (
    <div
      className={cn(
        'rounded-[3rem] border overflow-hidden transition-all duration-500',
        blurs[blur],
        variants[variant],
        hoverEffect && 'hover:border-white/10 hover:shadow-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
