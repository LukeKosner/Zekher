// components/layout/SidebarStateManager.tsx
// Client Component for sidebar state management

'use client';

import {useSidebar} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/AppSidebar';
import {SidebarInset} from '@/components/ui/sidebar';
import {PageHeader} from '@/components/layout/PageHeader';
import {RouteSlugGenerator} from './RouteSlugGenerator';

interface SidebarStateManagerProps {
  children: React.ReactNode;
}

export function SidebarStateManager({children}: SidebarStateManagerProps) {
  const {open, isMobile} = useSidebar();

  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen max-h-screen">
        <RouteSlugGenerator>
          {slug => (
            <PageHeader
              slug={slug}
              sidebarOpen={open}
              isMobile={isMobile}
            />
          )}
        </RouteSlugGenerator>
        <main className="flex-1 flex flex-col min-h-0">{children}</main>
      </SidebarInset>
    </>
  );
}