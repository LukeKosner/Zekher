'use client';

import {ArrowUpRight} from 'lucide-react';
import Link from 'next/link';
import type {ComponentProps} from 'react';

type BubbleLinkProps = ComponentProps<typeof Link> & {
  children: React.ReactNode;
  external?: boolean;
  icon?: boolean;
};

export function BubbleLink({
  children,
  external = true,
  icon = true,
  ...props
}: BubbleLinkProps) {
  const classes =
    'inline-flex items-center gap-1 px-2 md:px-3 rounded-full transition-colors bg-muted hover:bg-muted/70 text-inherit leading-tight';

  const content = (
    <>
      {children}
      {icon && (
        <ArrowUpRight className="w-[0.95em] h-[0.95em] translate-y-[0.5px]" />
      )}
    </>
  );

  if (external) {
    return (
      <a
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={classes} {...props}>
      {content}
    </Link>
  );
}
