"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, History, MessagesSquare } from "lucide-react";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function ChatHistoryPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const threads = useQuery(api.chat.listThreads, isAuthenticated ? {} : "skip");
  const sortedThreads = useMemo(
    () => [...(threads ?? [])].sort((a, b) => b.updatedAt - a.updatedAt),
    [threads]
  );

  if (isLoading || (isAuthenticated && threads === undefined)) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Loading chat history...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to view history</CardTitle>
            <CardDescription>
              Chat history is available for signed-in accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth?returnTo=%2Fchat%2Fhistory">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Chat History</h1>
          <p className="text-sm text-muted-foreground">
            Continue any previous conversation.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/chat">
            <MessagesSquare className="h-4 w-4" />
            New chat
          </Link>
        </Button>
      </div>

      {!sortedThreads.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No chats yet</CardTitle>
            <CardDescription>
              Start a conversation and it will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/chat">Start chatting</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/95 overflow-hidden py-0">
          <CardContent className="p-0">
            <ul className="divide-border/60 divide-y">
              {sortedThreads.map((thread, index) => {
                const chatNumber = sortedThreads.length - index;
                const title = index === 0 ? "Latest chat" : `Chat ${chatNumber}`;
                return (
                  <li key={thread._id} className="px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <p className="truncate text-sm font-medium">{title}</p>
                        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                          <History className="h-4 w-4 shrink-0" />
                          Updated {formatDate(thread.updatedAt)}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="shrink-0">
                        <Link
                          href={`/chat?thread=${thread._id}`}
                          aria-label={`Open ${title}`}
                        >
                          Open chat
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
