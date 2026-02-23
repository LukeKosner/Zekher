"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";
import { UserX } from "lucide-react";

const ACTIVE_GRACE_WINDOW_MS = 75_000;
const SECTION_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

interface Student {
  _id: Id<"students">;
  displayName: string;
  isActive: boolean;
  lastSeenAt: number;
  kickedAt?: number;
}

function isStudentActive(student: Student, now: number): boolean {
  if (student.kickedAt) return false;
  return student.isActive || now - student.lastSeenAt < ACTIVE_GRACE_WINDOW_MS;
}

function getStatusColor(student: Student, now: number): string {
  if (!isStudentActive(student, now)) return "bg-gray-400";
  const ago = now - student.lastSeenAt;
  if (ago < 60000) return "bg-green-500"; // < 1 min
  if (ago < 180000) return "bg-yellow-500"; // < 3 min
  return "bg-red-500"; // stale
}

function getStatusLabel(student: Student, now: number): string {
  return isStudentActive(student, now) ? "Active" : "Inactive";
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
  const now = Date.now();
  const presentStudents = students.filter((s) => !s.kickedAt);
  const active = presentStudents.filter((s) => isStudentActive(s, now));
  const inactive = presentStudents.filter((s) => !isStudentActive(s, now));
  const removed = students.filter((s) => Boolean(s.kickedAt));
  const showCombinedStatusList = presentStudents.length <= 1;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <p className={SECTION_LABEL_CLASS}>
          Students
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-3">
        {active.length === 0 && inactive.length === 0 && (
          <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No students have joined yet.
          </p>
        )}

        {showCombinedStatusList &&
          presentStudents.map((student) => (
            <div
              key={student._id}
              className="flex items-start gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <div
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  getStatusColor(student, now)
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate">{student.displayName}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {getStatusLabel(student, now)}
                </p>
              </div>
              {onKickStudent && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 shrink-0 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => onKickStudent(student._id)}
                  disabled={kickingStudentId === student._id}
                >
                  <UserX className="mr-1 h-3 w-3" />
                  {kickingStudentId === student._id ? "Removing..." : "Remove"}
                </Button>
              )}
            </div>
          ))}

        {!showCombinedStatusList && active.length > 0 && (
          <p className={SECTION_LABEL_CLASS}>
            Active
          </p>
        )}

        {!showCombinedStatusList && active.map((student) => (
          <div
            key={student._id}
            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <div
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                getStatusColor(student, now)
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

        {!showCombinedStatusList && inactive.length > 0 && (
          <>
            <p className={cn("pt-2", SECTION_LABEL_CLASS)}>
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
