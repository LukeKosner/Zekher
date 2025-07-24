// components/layout/RouteSlugGenerator.tsx
// Client Component for route-based slug generation

"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface RouteSlugGeneratorProps {
  children: (slug: string) => React.ReactNode;
}

export function RouteSlugGenerator({ children }: RouteSlugGeneratorProps) {
  const pathname = usePathname();

  const slug = useMemo(() => {
    if (pathname == "/sources") {
      return "sources/library";
    } else if (pathname.startsWith("/sources")) {
      return pathname;
    } else if (pathname.startsWith("/developers")) {
      return pathname;
    }

    switch (pathname) {
      case "/":
        return "/";
      case "/about":
        return "/about";
      case "/technology":
        return "/technology";
      case "/chat":
        return "/chat";
      default:
        return pathname;
    }
  }, [pathname]);

  return <>{children(slug)}</>;
}
