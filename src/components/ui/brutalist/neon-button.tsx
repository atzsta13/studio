'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';
import { Slot } from '@radix-ui/react-slot';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  haptic?: 'light' | 'medium' | 'success';
  asChild?: boolean;
}

export function NeonButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glow = true,
  haptic = 'medium',
  asChild = false,
  onClick,
  ...props
}: NeonButtonProps) {
  const hapticManager = useHaptic();

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic === 'light') hapticManager.lightTap();
    else if (haptic === 'success') hapticManager.successBurst();
    else hapticManager.mediumTap();

    if (onClick) onClick(e);
  };

  const variants = {
    primary: 'bg-primary text-white shadow-primary/30',
    accent: 'bg-accent text-black shadow-accent/30',
    secondary: 'bg-secondary text-white shadow-secondary/30',
    outline: 'bg-transparent border-2 border-white/10 text-white hover:border-primary/40',
    white: 'bg-white text-black shadow-white/10',
  };

  const sizes = {
    sm: 'h-10 px-6 text-[9px]',
    md: 'h-12 px-8 text-[10px]',
    lg: 'h-14 px-10 text-[11px]',
    xl: 'h-16 px-12 text-[12px]',
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      onClick={handleOnClick}
      className={cn(
        'inline-flex items-center justify-center rounded-[1.5rem] font-black uppercase tracking-[0.25em] transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        glow && variant !== 'outline' && 'shadow-2xl',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
