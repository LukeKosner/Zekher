"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib";

interface Message {
  _id: string;
  studentId: string;
  role: "user" | "assistant";
  content: string;
  sentAt: number;
}

interface Student {
  _id: string;
  displayName: string;
}

export function MessageFeed({
  messages,
  students,
}: {
  messages: Message[];
  students: Student[];
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const studentMap = new Map(students.map((s) => [s._id, s.displayName]));

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Messages come in desc order from query, reverse for display
  const sorted = [...messages].reverse();

  return (
    <div className="flex-1 overflow-auto p-4">
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No messages yet. Waiting for students to start chatting.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((msg) => {
            const studentName =
              studentMap.get(msg.studentId) ?? "Unknown Student";
            const label =
              msg.role === "user" ? studentName : `AI to ${studentName}`;

            return (
              <article
                key={msg._id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  msg.role === "assistant" ? "bg-muted/40" : "bg-background"
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </span>
                </div>
                <p
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    msg.role === "assistant" && "text-muted-foreground"
                  )}
                >
                  {msg.content.length > 200
                    ? msg.content.substring(0, 200) + "..."
                    : msg.content}
                </p>
              </article>
            );
          })}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
