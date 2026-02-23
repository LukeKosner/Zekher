// components/sidebar/SidebarFooter.tsx
// Client Component for responsive footer content

"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

function formatThreadLabel(updatedAt: number, chatNumber: number) {
  const formattedDate = new Date(updatedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
  return `Chat ${chatNumber} · ${formattedDate}`;
}

export function SidebarFooterContent() {
  const { open, isMobile, setOpen } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get("thread");
  const { isAuthenticated, isLoading } = useConvexAuth();
  const threads = useQuery(api.chat.listThreads, isAuthenticated ? {} : "skip");

  const recentThreads = useMemo(() => {
    return (threads ?? []).slice(0, 10);
  }, [threads]);

  const openHistory = () => {
    if (!isMobile && !open) {
      setOpen(true);
      return;
    }
    router.push("/chat/history");
  };

  if (isLoading || !isAuthenticated || !threads || threads.length === 0) {
    return (
      <div className="flex justify-center p-2">
        {open ? (
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/chat/history">
              <History className="h-4 w-4" />
              History
            </Link>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openHistory}
              >
                <History className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {!isMobile ? "Open sidebar" : "History"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-col items-center gap-2 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={openHistory}
            >
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {!isMobile ? "Open sidebar" : "All history"}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="text-sidebar-foreground/70 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium">
        Recent Chats
      </div>
      <SidebarMenu className="max-h-52 overflow-y-hidden pr-1 hover:overflow-y-auto">
        {recentThreads.map((thread, index) => {
          const isActive =
            pathname === "/chat" && activeThreadId === thread._id;
          const chatNumber = threads.length - index;
          return (
            <SidebarMenuItem key={thread._id}>
              <SidebarMenuButton asChild isActive={isActive} size="sm">
                <Link href={`/chat?thread=${thread._id}`}>
                  <span className="truncate">
                    {formatThreadLabel(thread.updatedAt, chatNumber)}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="default">
            <Link href="/chat/history">
              <History className="h-4 w-4" />
              <span>All history</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
