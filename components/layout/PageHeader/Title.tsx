// components/page-header/ConditionalTitle.tsx
// Client Component for dynamic title display based on sidebar state

"use client";

import Link from "next/link";
import type { ConditionalTitleProps } from "../types";

export function ConditionalTitle({
  sidebarOpen,
  isMobile,
  title
}: ConditionalTitleProps) {
  // Show title when sidebar is closed or collapsed
  const shouldShowTitle = sidebarOpen === false || isMobile;

  if (!shouldShowTitle) {
    return null;
  }

  return (
    <Link href="/">
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <h1 className="text-lg md:text-xl">{title}</h1>
      </div>
    </Link>
  );
}
