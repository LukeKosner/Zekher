"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { ChevronDown, Presentation, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/app/chat/components/ShareButton";
import { api } from "@/convex/_generated/api";
import {
  CHAT_RATE_REFRESH_EVENT,
  CHAT_SESSION_STORAGE_KEY
} from "@/app/chat/constants";
import { cn } from "@/lib";

function getClientSessionId() {
  if (typeof window === "undefined") return undefined;
  const existing = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, created);
  return created;
}

export function ChatHeaderActions({
  isChatRoute = false
}: {
  isChatRoute?: boolean;
}) {
  const pathname = usePathname();
  const isSharedChatRoute = pathname?.startsWith("/chat/shared/") ?? false;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [clientSessionId, setClientSessionId] = useState<string | undefined>(
    undefined
  );
  const [refreshNonce, setRefreshNonce] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isAuthenticated) return;
    setClientSessionId(getClientSessionId());
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    const onRefresh = () => {
      setRefreshNonce((current) => current + 1);
    };
    window.addEventListener(CHAT_RATE_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CHAT_RATE_REFRESH_EVENT, onRefresh);
    };
  }, [isAuthenticated]);

  const anonymousRate = useQuery(
    api.rateLimits.getAnonymousChatRateStatus,
    isChatRoute && !isSharedChatRoute && !isAuthenticated && clientSessionId
      ? { clientSessionId, refreshNonce }
      : "skip"
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setMenuOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  if (isLoading) {
    return null;
  }

  const showShareButton = isChatRoute && !isSharedChatRoute;

  if (isAuthenticated) {
    return (
      <>
        {showShareButton && <ShareButton iconOnly />}
        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2"
            aria-label="Account menu"
            title="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <User className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 min-w-48 rounded-md border bg-background p-1 shadow-md">
              <Link
                href="/classroom/teacher"
                className="flex h-8 items-center gap-2 rounded-sm px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMenuOpen(false)}
              >
                <Presentation className="h-4 w-4" />
                Teacher dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  const messagesLeftText =
    anonymousRate && anonymousRate.remaining >= 0
      ? `${anonymousRate.remaining} message${
          anonymousRate.remaining === 1 ? "" : "s"
        } left`
      : null;

  return (
    <div className="flex items-center gap-2">
      {messagesLeftText ? (
        <span
          className={cn(
            "hidden text-[11px] leading-none text-muted-foreground sm:inline",
            anonymousRate?.remaining === 0 && "text-destructive/90"
          )}
        >
          {messagesLeftText}
        </span>
      ) : null}
      <Button asChild variant="outline" size="sm" className="h-8">
        <Link
          href="/auth?returnTo=%2Fchat"
          aria-label="Sign in"
          title="Sign in"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </Button>
    </div>
  );
}
