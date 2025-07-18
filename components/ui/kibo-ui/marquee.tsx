'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Marquee = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  />
));
Marquee.displayName = 'Marquee';

const MarqueeContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    pauseOnHover?: boolean;
  }
>(({ className, pauseOnHover = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex animate-marquee items-center',
      pauseOnHover && 'hover:[animation-play-state:paused]',
      className
    )}
    {...props}
  />
));
MarqueeContent.displayName = 'MarqueeContent';

const MarqueeFade = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    side: 'left' | 'right';
  }
>(({ className, side, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute top-0 z-10 h-full w-32 pointer-events-none',
      side === 'left'
        ? 'left-0 bg-gradient-to-r from-background to-transparent'
        : 'right-0 bg-gradient-to-l from-background to-transparent',
      className
    )}
    {...props}
  />
));
MarqueeFade.displayName = 'MarqueeFade';

const MarqueeItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-shrink-0', className)}
    {...props}
  />
));
MarqueeItem.displayName = 'MarqueeItem';

export { Marquee, MarqueeContent, MarqueeFade, MarqueeItem };