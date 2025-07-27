// components/layout/SidebarStateManager.tsx
// Client Component for sidebar state management

"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageFooter } from "@/components/layout/PageFooter";
import { RouteSlugGenerator } from "./RouteSlugGenerator";
// =============================================================================
// SIDEBAR STATE MANAGER CONSTANTS
// =============================================================================

const layoutConstants = {
  siteName: "Zekher זכר",
  description:
    "Access authoritative Holocaust education materials through AI-powered search of Yad Vashem resources and survivor testimonies. Built to preserve memory and combat denial.",
  siteUrl: "https://zekher.com",
  themeColor: "#1f2937",
  icons: {
    favicon32: {
      url: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    },
    favicon16: {
      url: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png"
    },
    appleTouchIcon: {
      url: "/apple-touch-icon.png",
      sizes: "192x192",
      type: "image/png"
    },
    openGraphImage: {
      url: "/opengraph-image.png",
      width: 512,
      height: 512,
      alt: "Zekher - Holocaust Education"
    }
  },
  manifest: "/site.webmanifest",
  dnsPreFetch: {
    googleFonts: "//fonts.googleapis.com",
    googleFontsStatic: "//fonts.gstatic.com"
  }
} as const;
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
      <SidebarInset className={`flex flex-col ${isChatRoute ? 'h-screen max-h-screen' : 'min-h-screen'}`}>
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
        <main className={`flex-1 ${isChatRoute ? 'overflow-y-auto' : ''}`}>
          {children}
        </main>
        {!isChatRoute && <PageFooter />}
      </SidebarInset>
    </>
  );
}
