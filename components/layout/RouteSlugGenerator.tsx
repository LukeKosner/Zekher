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
    switch (pathname) {
      case "/":
        return "project/home";
      case "/technology":
        return "project/technology";
      case "/chat":
        return "everyone/chat";
      case "/documentation":
        return "developers/documentation";
      case "/developers":
        return "developers/get started";
      case "/sources":
        return "everyone/sources";
      case "/auth":
        return "everyone/accounts";
      default:
        return "project/home";
    }
  }, [pathname]);

  return <>{children(slug)}</>;
}