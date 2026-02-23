// components/page-header/ConditionalTitle.tsx
// Client Component for dynamic title display based on sidebar state

"use client";

import Link from "next/link";
import type { ConditionalTitleProps } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ConditionalTitle({
  sidebarOpen,
  isMobile,
  title
}: ConditionalTitleProps) {
  const showBeta = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  // Show title when sidebar is closed or collapsed
  const shouldShowTitle = sidebarOpen === false || isMobile;

  if (!shouldShowTitle) {
    return null;
  }

  return (
    <Link href="/">
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h1 className="text-lg md:text-xl cursor-pointer">
                {title}
                {showBeta ? (
                  <span className="text-muted-foreground"> Beta</span>
                ) : null}
              </h1>
            </TooltipTrigger>
            <TooltipContent>
              <p>זכר - "remembrance" in Hebrew</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Link>
  );
}
