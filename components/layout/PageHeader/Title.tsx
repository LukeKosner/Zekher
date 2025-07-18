// components/page-header/ConditionalTitle.tsx
// Client Component for dynamic title display based on sidebar state

'use client';

import Link from 'next/link';

interface ConditionalTitleProps {
  sidebarOpen?: boolean;
  isMobile?: boolean;
}

export function ConditionalTitle({
  sidebarOpen,
  isMobile,
}: ConditionalTitleProps) {
  // Show title when sidebar is closed or collapsed
  const shouldShowTitle = sidebarOpen === false || isMobile;

  if (!shouldShowTitle) {
    return null;
  }

  return (
    <Link href="/">
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-lg md:text-xl">Zekher זכר</h1>
      </div>
    </Link>
  );
}