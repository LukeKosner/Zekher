"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageFooter } from "@/components/layout/PageFooter";
import { RouteSlugGenerator } from "./RouteSlugGenerator";
import { layoutConstants } from "./config";
import { usePathname } from "next/navigation";
import type { SidebarStateManagerProps } from "./types";

export function SidebarStateManager({ children }: SidebarStateManagerProps) {
  const { open, isMobile } = useSidebar();
  const title = layoutConstants.siteName;
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/chat");

  return (
    <>
      <AppSidebar />
      <SidebarInset
        className={`flex flex-col ${
          isChatRoute ? "h-[100dvh] max-h-[100dvh]" : "min-h-screen"
        }`}
      >
        <RouteSlugGenerator>
          {(slug) => (
            <PageHeader
              slug={slug}
              title={title}
              sidebarOpen={open}
              isMobile={isMobile}
              isChatRoute={isChatRoute}
            />
          )}
        </RouteSlugGenerator>
        <main
          className={`flex-1 ${
            isChatRoute
              ? `overflow-y-auto flex-1 ${
                  open ? "pt-12 md:pt-16" : "pt-12 md:pt-12"
                }`
              : `${open ? "pt-12 md:pt-16" : "pt-12 md:pt-12"}`
          }`}
        >
          {children}
        </main>
        {!isChatRoute && <PageFooter />}
      </SidebarInset>
    </>
  );
}
