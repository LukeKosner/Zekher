"use client";

import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Share2 } from "lucide-react";
import { cn } from "@/lib";
import { AnimatePresence, motion } from "motion/react";
import {
  CHAT_SESSION_STORAGE_KEY,
  CHAT_THREAD_STORAGE_KEY,
  CHAT_THREAD_UPDATED_EVENT
} from "../constants";

function getClientSessionId() {
  if (typeof window === "undefined") return undefined;
  const existing = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, created);
  return created;
}

function getStoredThreadId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CHAT_THREAD_STORAGE_KEY);
}

function ShareStateSwitch({
  checked,
  disabled,
  onCheckedChange
}: {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
        disabled && "cursor-not-allowed opacity-50"
      )}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      <motion.span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-background"
        )}
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 650, damping: 38 }}
      />
    </motion.button>
  );
}

type ShareButtonProps = {
  threadId?: string | null;
  iconOnly?: boolean;
  className?: string;
};

export function ShareButton({
  threadId,
  iconOnly = false,
  className
}: ShareButtonProps) {
  const createShare = useMutation(api.shares.createShare);
  const revokeSharesForThread = useMutation(api.shares.revokeSharesForThread);
  const [resolvedThreadId, setResolvedThreadId] = useState<string | null>(threadId ?? getStoredThreadId());
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [origin, setOrigin] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(getClientSessionId());
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (threadId !== undefined) {
      setResolvedThreadId(threadId ?? null);
      return;
    }

    const syncThreadId = () => {
      setResolvedThreadId(getStoredThreadId());
    };

    const onThreadUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ threadId?: string | null }>;
      setResolvedThreadId(customEvent.detail?.threadId ?? null);
    };

    syncThreadId();
    window.addEventListener("storage", syncThreadId);
    window.addEventListener(CHAT_THREAD_UPDATED_EVENT, onThreadUpdated);

    return () => {
      window.removeEventListener("storage", syncThreadId);
      window.removeEventListener(CHAT_THREAD_UPDATED_EVENT, onThreadUpdated);
    };
  }, [threadId]);

  const hasShareContext = !!resolvedThreadId && !!sessionId;
  const canManageShare = useQuery(
    api.shares.canManageSharesForThread,
    hasShareContext
      ? {
          threadId: resolvedThreadId as Id<"chatThreads">,
          clientSessionId: sessionId
        }
      : "skip"
  );
  const canShare = hasShareContext && canManageShare === true;
  const existingShare = useQuery(
    api.shares.getMyActiveShareForThread,
    canShare
      ? {
          threadId: resolvedThreadId as Id<"chatThreads">,
          clientSessionId: sessionId
        }
      : "skip"
  );
  useEffect(() => {
    if (existingShare?.slug) {
      setCreatedSlug(null);
    }
  }, [existingShare?.slug]);

  useEffect(() => {
    if (
      threadId !== undefined ||
      typeof window === "undefined" ||
      canManageShare !== false
    ) {
      return;
    }
    window.localStorage.removeItem(CHAT_THREAD_STORAGE_KEY);
    setResolvedThreadId(null);
    setCreatedSlug(null);
  }, [canManageShare, threadId]);

  const effectiveSlug = existingShare?.slug ?? createdSlug;
  const isShared = !!effectiveSlug;
  const shareUrl = effectiveSlug ? `${origin}/chat/shared/${effectiveSlug}` : null;
  const loadingShareAccess = hasShareContext && canManageShare === undefined;
  const loadingShareState = loadingShareAccess || (canShare && existingShare === undefined);

  const buttonTitle = useMemo(() => {
    if (!hasShareContext) return "Send a message to enable sharing.";
    if (canManageShare === false) {
      return "This chat is no longer shareable in the current session.";
    }
    if (actionLoading) return "Updating share settings...";
    if (dialogOpen) return "Manage sharing";
    if (error) return error;
    return isShared ? "Manage shared link" : "Share chat";
  }, [actionLoading, canManageShare, dialogOpen, error, hasShareContext, isShared]);

  const onSwitchChange = async (nextChecked: boolean) => {
    if (!resolvedThreadId || !canShare) return;

    if (nextChecked && isShared) return;
    if (!nextChecked && !isShared) return;

    setActionLoading(true);
    setError(null);
    try {
      if (nextChecked) {
        const result = await createShare({
          threadId: resolvedThreadId as Id<"chatThreads">,
          clientSessionId: sessionId
        });
        setCreatedSlug(result.slug);
      } else {
        await revokeSharesForThread({
          threadId: resolvedThreadId as Id<"chatThreads">,
          clientSessionId: sessionId
        });
        setCreatedSlug(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update share settings";
      if (message === "Not authorized") {
        setError("This chat is no longer available for sharing.");
        if (typeof window !== "undefined" && threadId === undefined) {
          window.localStorage.removeItem(CHAT_THREAD_STORAGE_KEY);
          setResolvedThreadId(null);
        }
      } else {
        setError(message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const onCopyLink = async () => {
    if (!shareUrl) return;
    setError(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Failed to copy link");
    }
  };

  const button = (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : "outline"}
      size={iconOnly ? "icon" : "sm"}
      disabled={actionLoading}
      className={cn(iconOnly && "h-8 w-8", className)}
      aria-label={buttonTitle}
      title={buttonTitle}
    >
      <Share2 className={cn("h-4 w-4", !iconOnly && "mr-2")} />
      {!iconOnly && "Share"}
    </Button>
  );

  return (
    <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogPrimitive.Trigger asChild>{button}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-5 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2">
          <DialogPrimitive.Title className="text-base font-semibold">
            Share This Chat
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
            Turn sharing on to publish a read-only link. Turn it off to unshare.
          </DialogPrimitive.Description>

          {!canShare ? (
            <motion.p
              className="mt-5 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {!hasShareContext
                ? "Send at least one message before creating a share link."
                : canManageShare === false
                  ? "This chat is no longer available in the current session. Send a new message to create a fresh shareable thread."
                  : "Checking share availability..."}
            </motion.p>
          ) : (
            <motion.div
              className="mt-5 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <motion.div
                className="flex items-center justify-between rounded-lg border p-3"
                layout
              >
                <div>
                  <p className="text-sm font-medium">Public Link</p>
                  <p className="text-xs text-muted-foreground">
                    {isShared ? "Anyone with the link can view this chat." : "Link is currently disabled."}
                  </p>
                </div>
                <ShareStateSwitch
                  checked={isShared}
                  disabled={loadingShareState || actionLoading}
                  onCheckedChange={onSwitchChange}
                />
              </motion.div>

              <AnimatePresence>
                {shareUrl ? (
                  <motion.div
                    className="space-y-2 rounded-lg border p-3"
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Share Link
                    </p>
                    <div className="rounded-md bg-muted/60 px-2.5 py-2 text-xs break-all">
                      {shareUrl}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCopyLink}
                      >
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        {copied ? "Copied" : "Copy link"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" asChild>
                        <a href={shareUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}

          <AnimatePresence>
            {error ? (
              <motion.p
                className="mt-3 text-xs text-destructive"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {copied && !error ? (
              <motion.p
                className="mt-3 text-xs text-muted-foreground"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                Link copied to clipboard.
              </motion.p>
            ) : null}
          </AnimatePresence>

          <motion.div
            className="mt-5 flex justify-end"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: 0.06 }}
          >
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="sm">
                Done
              </Button>
            </DialogPrimitive.Close>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
