// components/sidebar/SidebarFooter.tsx
// Client Component for responsive footer content

"use client";

import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarFooterContent() {
  const { open } = useSidebar();

  return (
    <div className="flex justify-center p-2">
      <Link
        href="https://github.com/LukeKosner/Zekher"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md p-2 hover:bg-sidebar-accent ${
          !open ? "justify-center" : ""
        }`}
        title="GitHub Repository"
      >
        <Image
          src="/github-mark.svg"
          alt="GitHub"
          width={24}
          height={24}
          className="h-6 w-6 flex-shrink-0"
        />
        {open && <span>GitHub</span>}
      </Link>
    </div>
  );
}
