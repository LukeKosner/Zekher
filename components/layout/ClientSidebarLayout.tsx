// components/ClientSidebarLayout.tsx
// Optimized Client Component for interactive sidebar functionality

'use client';

import * as Sentry from '@sentry/nextjs';
import {SidebarProvider} from '@/components/ui/sidebar';
import {SidebarStateManager} from '@/components/layout/SidebarStateManager';

export function ClientSidebarLayout({children}: {children: React.ReactNode}) {
  // Log routing for monitoring (keep minimal client-side logic)
  if (typeof window !== 'undefined') {
    const {logger} = Sentry;
    logger.info('Sidebar layout mounted');
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarStateManager>{children}</SidebarStateManager>
    </SidebarProvider>
  );
}