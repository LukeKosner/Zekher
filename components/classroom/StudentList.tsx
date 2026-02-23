"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";
import { UserX } from "lucide-react";

interface Student {
  _id: Id<"students">;
  displayName: string;
  isActive: boolean;
  lastSeenAt: number;
  kickedAt?: number;
}

function getStatusColor(student: Student): string {
  if (!student.isActive) return "bg-gray-400";
  const ago = Date.now() - student.lastSeenAt;
  if (ago < 60000) return "bg-green-500"; // < 1 min
  if (ago < 180000) return "bg-yellow-500"; // < 3 min
  return "bg-red-500"; // stale
}

export function StudentList({
  students,
  onKickStudent,
  kickingStudentId,
}: {
  students: Student[];
  onKickStudent?: (studentId: Id<"students">) => void;
  kickingStudentId?: Id<"students"> | null;
}) {
  const active = students.filter((s) => s.isActive && !s.kickedAt);
  const inactive = students.filter((s) => !s.isActive && !s.kickedAt);
  const removed = students.filter((s) => Boolean(s.kickedAt));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Students
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-3">
        {active.length === 0 && inactive.length === 0 && (
          <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No students have joined yet.
          </p>
        )}

        {active.length > 0 && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Active
          </p>
        )}

        {active.map((student) => (
          <div
            key={student._id}
            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <div
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                getStatusColor(student)
              )}
            />
            <span className="min-w-0 flex-1 truncate">{student.displayName}</span>
            {onKickStudent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => onKickStudent(student._id)}
                disabled={kickingStudentId === student._id}
              >
                <UserX className="mr-1 h-3 w-3" />
                {kickingStudentId === student._id ? "Removing..." : "Remove"}
              </Button>
            )}
          </div>
        ))}

        {inactive.length > 0 && (
          <>
            <p className="pt-2 text-xs uppercase tracking-wider text-muted-foreground">
              Inactive
            </p>
            {inactive.map((student) => (
              <div
                key={student._id}
                className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"
              >
                <div className="h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                <span className="min-w-0 flex-1 truncate">{student.displayName}</span>
                {onKickStudent && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => onKickStudent(student._id)}
                    disabled={kickingStudentId === student._id}
                  >
                    <UserX className="mr-1 h-3 w-3" />
                    {kickingStudentId === student._id ? "Removing..." : "Remove"}
                  </Button>
                )}
              </div>
            ))}
          </>
        )}

        {removed.length > 0 && (
          <>
            <p className="pt-2 text-xs uppercase tracking-wider text-muted-foreground">
              Removed
            </p>
            {removed.map((student) => (
              <div
                key={student._id}
                className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"
              >
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span className="truncate">{student.displayName}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
