"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { StudentList } from "@/components/classroom/StudentList";
import { MessageFeed } from "@/components/classroom/MessageFeed";
import {
  AIInput,
  AIInputSubmit,
  AIInputField,
} from "@/components/ui/kibo-ui/ai/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  CheckCircle2,
  StopCircle,
  Link as LinkIcon,
} from "lucide-react";

type TeacherPromptType = "forced" | "suggested" | "assignment";

export default function LiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as Id<"classes">;

  const { isAuthenticated, isLoading } = useConvexAuth();
  const classData = useQuery(api.classes.getClassById, { classId });
  const students = useQuery(
    api.students.getStudentsInClass,
    isAuthenticated ? { classId } : "skip"
  );
  const recentMessages = useQuery(api.classMessages.getRecentActivity, {
    classId,
  });
  const endClass = useMutation(api.classes.endClass);
  const kickStudent = useMutation(api.students.kickStudent);
  const sendPrompt = useMutation(api.forcedPrompts.sendForcedPrompt);

  const [promptText, setPromptText] = useState("");
  const [promptType, setPromptType] = useState<TeacherPromptType>("suggested");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [ending, setEnding] = useState(false);
  const [kickingStudentId, setKickingStudentId] = useState<Id<"students"> | null>(
    null
  );
  const [sendingPrompt, setSendingPrompt] = useState(false);

  const promptTypeMeta: Record<
    TeacherPromptType,
    { label: string; placeholder: string }
  > = {
    forced: {
      label: "Teacher interrupt",
      placeholder: "Send an interrupt prompt students must answer...",
    },
    suggested: {
      label: "Suggested prompt",
      placeholder: "Suggest a prompt students can ask...",
    },
    assignment: {
      label: "Assignment instructions",
      placeholder: "Share assignment instructions...",
    },
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(
        `/auth?returnTo=${encodeURIComponent(`/classroom/teacher/class/${classId}`)}`
      );
    }
  }, [isLoading, isAuthenticated, classId, router]);

  useEffect(() => {
    if (classData && classData.status === "ended") {
      router.push(`/classroom/teacher/class/${classId}/history`);
    }
  }, [classData, classId, router]);

  useEffect(() => {
    if (typeof window === "undefined" || !classData?.joinCode) {
      setJoinUrl("");
      return;
    }

    const url = new URL("/classroom/join", window.location.origin);
    url.searchParams.set("code", classData.joinCode);
    setJoinUrl(url.toString());
  }, [classData?.joinCode]);

  if (isLoading || !isAuthenticated || !classData) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (classData.status === "ended") {
    return null;
  }

  const handleEndClass = async () => {
    if (!confirm("End this class? Students will be disconnected.")) return;
    setEnding(true);
    await endClass({ classId });
    router.push(`/classroom/teacher/class/${classId}/history`);
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt || sendingPrompt) return;

    setSendingPrompt(true);
    try {
      await sendPrompt({
        classId,
        promptText: trimmedPrompt,
        promptType,
      });
      setPromptText("");
    } finally {
      setSendingPrompt(false);
    }
  };

  const handleKickStudent = async (studentId: Id<"students">) => {
    if (!confirm("Remove this student from the live class?")) return;

    setKickingStudentId(studentId);
    try {
      await kickStudent({ classId, studentId });
    } finally {
      setKickingStudentId(null);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(classData.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyJoinLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{classData.name}</p>
            {classData.topic && (
              <p className="text-xs text-muted-foreground">{classData.topic}</p>
            )}
          </div>

          <div className="flex-1" />

          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndClass}
            disabled={ending}
          >
            <StopCircle className="mr-1 h-4 w-4" />
            End Class
          </Button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="flex-1 min-h-0 overflow-auto bg-muted/20">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4 p-4 sm:p-6 lg:px-8">
          <section className="min-h-[260px] rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="grid h-full gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-stretch">
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Class Code
                  </p>
                  <p className="font-mono text-5xl leading-none font-black tracking-[0.3em] text-foreground sm:text-6xl">
                    {classData.joinCode}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground/90">
                    Scan the QR code or visit this link to join.
                  </p>
                  <p className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs leading-snug text-muted-foreground">
                    {joinUrl || "Preparing join link..."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={copyCode}>
                    {copiedCode ? (
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                    ) : (
                      <Copy className="mr-1 h-4 w-4" />
                    )}
                    {copiedCode ? "Code Copied" : "Copy Code"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyJoinLink}
                    disabled={!joinUrl}
                  >
                    {copiedLink ? (
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                    ) : (
                      <LinkIcon className="mr-1 h-4 w-4" />
                    )}
                    {copiedLink ? "Link Copied" : "Copy Join Link"}
                  </Button>
                </div>
              </div>

              <div className="mx-auto flex h-full w-full items-center justify-center p-0">
                <QRCodeSVG
                  value={joinUrl || classData.joinCode}
                  size={260}
                  level="M"
                  includeMargin
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>
          </section>

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-h-0 overflow-hidden rounded-xl border bg-card">
              <StudentList
                students={students ?? []}
                onKickStudent={handleKickStudent}
                kickingStudentId={kickingStudentId}
              />
            </aside>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
              <MessageFeed
                messages={recentMessages ?? []}
                students={students ?? []}
              />

              <div className="space-y-3 border-t bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Prompt Type
                  </span>
                  <Select
                    value={promptType}
                    onValueChange={(value) =>
                      setPromptType(value as TeacherPromptType)
                    }
                  >
                    <SelectTrigger size="sm" className="w-52 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(promptTypeMeta) as TeacherPromptType[]).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {promptTypeMeta[type].label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <AIInput onSubmit={handleSendPrompt}>
                  <AIInputField
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    aria-label="Send a prompt to all students"
                    placeholder={promptTypeMeta[promptType].placeholder}
                  />
                  <AIInputSubmit
                    disabled={!promptText.trim() || sendingPrompt}
                    status={sendingPrompt ? "submitted" : "ready"}
                  />
                </AIInput>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
