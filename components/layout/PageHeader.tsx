// components/page-header.tsx
// Optimized PageHeader with server/client component split

import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbNavigation } from "@/components/layout/PageHeader/Breadcrumb";
import { ConditionalTitle } from "@/components/layout/PageHeader/Title";
import { Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib";

export function PageHeader({
  slug,
  title,
  sidebarOpen,
  isMobile
}: {
  slug: string;
  title: string;
  sidebarOpen?: boolean;
  isMobile?: boolean;
}) {
  // Step 1: Add computed gap variable
  const gap = isMobile
    ? "0px"
    : sidebarOpen
    ? "var(--sidebar-width)"
    : "var(--sidebar-width-icon)";

  return (
    <header
      // Step 2: Inline the gap into the header's style
      style={{ left: gap, width: `calc(100% - ${gap})` }}
      className={cn(
        "fixed inset-y-0 top-0 z-50 flex items-center gap-2",
        // Height: shorter when sidebar is closed (keep mobile at h-12)
        sidebarOpen ? "h-12 md:h-16" : "h-12 md:h-12",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b border-border overscroll-none",
        // Step 3: Add smooth transitions and remove old width classes
        "transition-[left,width,height] duration-200 ease-linear"
      )}
    >
      {/* Desktop: Sidebar trigger  breadcrumbs */}
      <div className="items-center gap-2 px-4 hidden md:flex">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <BreadcrumbNavigation slug={slug} />
      </div>

      <ConditionalTitle
        title={title}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      {/* Mobile: Menu trigger on right */}
      <div className="flex items-center gap-2 ml-auto px-4">
        <SidebarTrigger className="md:hidden">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
      </div>
    </header>
  );
}
