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
  // Desktop only: compute gap for positioning
  const gap = sidebarOpen
    ? "var(--sidebar-width)"
    : "var(--sidebar-width-icon)";

  return (
    <header
      // Desktop only: use computed positioning via CSS custom properties
      style={{ 
        "--computed-left": gap,
        "--computed-width": `calc(100% - ${gap})`
      } as React.CSSProperties}
      className={cn(
        "fixed inset-y-0 top-0 z-50 flex items-center gap-2",
        // Height: shorter when sidebar is closed (keep mobile at h-12)
        sidebarOpen ? "h-12 md:h-16" : "h-12 md:h-12",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b border-border overscroll-none",
        // Mobile: full width
        "left-0 right-0 w-full",
        // Desktop: computed positioning with transition matching sidebar close duration
        "md:left-[var(--computed-left)] md:w-[var(--computed-width)] md:right-auto",
        "transition-[left,width,height] duration-300 ease-in-out"
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
