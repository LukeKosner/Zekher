// components/page-header.tsx
// Optimized PageHeader with server/client component split

import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbNavigation } from "@/components/layout/PageHeader/Breadcrumb";
import { ConditionalTitle } from "@/components/layout/PageHeader/Title";
import { Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";

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
  return (
    <header className="sticky top-0 z-50 flex h-12 md:h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* Desktop: Sidebar trigger + breadcrumbs */}
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
