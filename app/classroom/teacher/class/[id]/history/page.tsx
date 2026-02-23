"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib";

const TOOL_SUMMARY_PATTERNS: RegExp[] = [
  /^(Lexicon search|Testimony search|Audio search) is searching\.\.\.$/,
  /^(Lexicon search|Testimony search|Audio search) returned results\.$/,
  /^(Lexicon search|Testimony search|Audio search) returned \d+ result(s)?\.$/,
  /^(Lexicon search|Testimony search|Audio search) returned \d+ audio segment(s)?\.$/,
];

function isToolSummaryBlock(block: string): boolean {
  return TOOL_SUMMARY_PATTERNS.some((pattern) => pattern.test(block.trim()));
}

function formatTeacherHistoryContent(content: string): {
  displayText: string;
  hasToolCall: boolean;
} {
  const blocks = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const visibleBlocks: string[] = [];
  let hasToolCall = false;
  const reasoningStartIndex = blocks.findIndex((block) =>
    block.startsWith("Reasoning:")
  );

  if (reasoningStartIndex >= 0) {
    const trailingBlocks = blocks
      .slice(reasoningStartIndex + 1)
      .filter((block) => !isToolSummaryBlock(block));

    for (const block of blocks) {
      if (isToolSummaryBlock(block)) {
        hasToolCall = true;
      }
    }

    const firstCitationIndex = trailingBlocks.findIndex((block) =>
      /\[([^\]]+)\]\([^)]+\)/.test(block)
    );

    if (firstCitationIndex >= 0) {
      return {
        displayText: trailingBlocks.slice(firstCitationIndex).join("\n\n").trim(),
        hasToolCall,
      };
    }

    return {
      // If no citation exists, keep the last trailing block so answers do not disappear.
      displayText: trailingBlocks.length > 0 ? trailingBlocks[trailingBlocks.length - 1] : "",
      hasToolCall,
    };
  }

  for (const block of blocks) {
    if (isToolSummaryBlock(block)) {
      hasToolCall = true;
      continue;
    }

    visibleBlocks.push(block);
  }

  return {
    displayText: visibleBlocks.join("\n\n").trim(),
    hasToolCall,
  };
}

export default function ClassHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as Id<"classes">;

  const { isAuthenticated, isLoading } = useConvexAuth();
  const classData = useQuery(
    api.classes.getClassById,
    isAuthenticated ? { classId } : "skip"
  );
  const students = useQuery(
    api.students.getStudentsInClass,
    isAuthenticated ? { classId } : "skip"
  );
  const messages = useQuery(
    api.classMessages.getMessagesForClass,
    isAuthenticated ? { classId } : "skip"
  );

  const [selectedStudent, setSelectedStudent] = useState<Id<"students"> | null>(
    null
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(
        `/auth?returnTo=${encodeURIComponent(
          `/classroom/teacher/class/${classId}/history`
        )}`
      );
    }
  }, [isLoading, isAuthenticated, classId, router]);

  if (isLoading || !isAuthenticated || !classData || !students || !messages) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const studentMap = new Map(students.map((s) => [s._id, s]));
  const sortedStudents = [...students].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
  const messageCountByStudent = messages.reduce((map, message) => {
    map.set(message.studentId, (map.get(message.studentId) ?? 0) + 1);
    return map;
  }, new Map<Id<"students">, number>());
  const filteredMessages = selectedStudent
    ? messages.filter((m) => m.studentId === selectedStudent)
    : messages;

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold">{classData.name} History</h1>
          <Badge variant="secondary">{messages.length} messages</Badge>
          {selectedStudent && (
            <Badge variant="outline">
              {studentMap.get(selectedStudent)?.displayName ?? "Student"}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="mx-auto grid h-full min-h-0 w-full max-w-7xl gap-4 p-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          <aside className="min-h-0 overflow-hidden rounded-xl border bg-card">
            <div className="space-y-4 overflow-auto p-3">
              <div className="space-y-1.5">
                <p className="px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  View
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    !selectedStudent
                      ? "border-foreground/20 bg-muted font-medium shadow-sm"
                      : "border-border/60 bg-background hover:bg-muted/50"
                  )}
                >
                  <span className="font-medium">All Students</span>
                  <span className="text-xs text-muted-foreground">
                    {messages.length}
                  </span>
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Students
                </p>

                <div className="space-y-1">
                  {sortedStudents.map((student) => {
                    const messageCount =
                      messageCountByStudent.get(student._id) ?? 0;

                    return (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => setSelectedStudent(student._id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          selectedStudent === student._id
                            ? "border-foreground/20 bg-muted shadow-sm"
                            : "border-border/60 bg-background hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">
                            {student.displayName}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {messageCount}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {messageCount} message{messageCount === 1 ? "" : "s"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <section className="min-h-0 overflow-auto rounded-xl border bg-card p-4">
            {filteredMessages.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No messages recorded for this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg) => {
                  const student = studentMap.get(msg.studentId);
                  const {
                    displayText: sanitizedContent,
                    hasToolCall,
                  } =
                    msg.role === "assistant"
                      ? formatTeacherHistoryContent(msg.content)
                      : { displayText: msg.content, hasToolCall: false };

                  const roleLabel =
                    msg.role === "user"
                      ? student?.displayName ?? "Student"
                      : `AI to ${student?.displayName ?? "Student"}`;

                  return (
                    <article
                      key={msg._id}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm",
                        msg.role === "assistant" ? "bg-muted/40" : "bg-background"
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 font-medium">
                          {roleLabel}
                          {msg.role === "assistant" && hasToolCall && (
                            <span className="rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                              Tool call
                            </span>
                          )}
                        </span>
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
                        {sanitizedContent || (hasToolCall ? "[Tool call]" : "")}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
