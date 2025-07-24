// components/layout/SidebarStateManager.tsx
// Client Component for sidebar state management

"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageFooter } from "@/components/layout/PageFooter";
import { RouteSlugGenerator } from "./RouteSlugGenerator";
import { layoutConstants } from "@/app/constants";
import { usePathname } from "next/navigation";

interface SidebarStateManagerProps {
  children: React.ReactNode;
}

export function SidebarStateManager({ children }: SidebarStateManagerProps) {
  const { open, isMobile } = useSidebar();
  const title = layoutConstants.siteName;
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith('/chat');

  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen max-h-screen">
        <RouteSlugGenerator>
          {(slug) => (
            <PageHeader
              slug={slug}
              title={title}
              sidebarOpen={open}
              isMobile={isMobile}
            />
          )}
        </RouteSlugGenerator>
        <main className="flex-1 flex flex-col min-h-0 overflow-auto">
          <div className="flex flex-col min-h-full">
            <div className="flex-1">{children}</div>
            {!isChatRoute && <PageFooter />}
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
