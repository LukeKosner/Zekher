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
import { cn } from "@/lib";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type TeacherPromptType = "forced" | "suggested" | "assignment";
const SECTION_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export default function LiveClassPage() {
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
  const recentMessages = useQuery(
    api.classMessages.getRecentActivity,
    isAuthenticated ? { classId } : "skip"
  );
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [isClassCodeCollapsed, setIsClassCodeCollapsed] = useState(false);

  const promptTypeMeta: Record<
    TeacherPromptType,
    { label: string; placeholder: string; description: string }
  > = {
    forced: {
      label: "Teacher interrupt",
      placeholder: "Force an immediate AI response in student chats...",
      description:
        "This pushes the prompt into each student chat so the model responds right away.",
    },
    suggested: {
      label: "Suggested prompt",
      placeholder: "Suggest a prompt students can ask...",
      description: "Adds a tappable question students can choose to send.",
    },
    assignment: {
      label: "Assignment instructions",
      placeholder: "Share assignment instructions...",
      description: "Shows as setup guidance before students start chatting.",
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `classroom_setup_warning_${classId}`;
    const warning = sessionStorage.getItem(storageKey);
    if (!warning) return;
    sessionStorage.removeItem(storageKey);
    setSetupWarning(warning);
  }, [classId]);

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
  const joinCode = classData.joinCode ?? "";

  const handleEndClass = async () => {
    if (!confirm("End this class? Students will be disconnected.")) return;

    setActionError(null);
    setEnding(true);
    try {
      await endClass({ classId });
      router.push(`/classroom/teacher/class/${classId}/history`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to end class right now."
      );
    } finally {
      setEnding(false);
    }
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt || sendingPrompt) return;

    setActionError(null);
    setSendingPrompt(true);
    try {
      await sendPrompt({
        classId,
        promptText: trimmedPrompt,
        promptType,
      });
      setPromptText("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to send prompt right now."
      );
    } finally {
      setSendingPrompt(false);
    }
  };

  const handleKickStudent = async (studentId: Id<"students">) => {
    if (!confirm("Remove this student from the live class?")) return;

    setActionError(null);
    setKickingStudentId(studentId);
    try {
      await kickStudent({ classId, studentId });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to remove student."
      );
    } finally {
      setKickingStudentId(null);
    }
  };

  const copyCode = async () => {
    try {
      setActionError(null);
      await navigator.clipboard.writeText(joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setActionError("Unable to copy class code. You can copy it manually.");
    }
  };

  const copyJoinLink = async () => {
    if (!joinUrl) return;
    try {
      setActionError(null);
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setActionError("Unable to copy join link. You can copy it manually.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
        <div className="flex w-full flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
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
        {(setupWarning || actionError) && (
          <div className="w-full space-y-2 px-4 pb-4 sm:px-6 lg:px-8">
            {setupWarning && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
                {setupWarning}
              </div>
            )}
            {actionError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {actionError}
              </div>
            )}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden bg-muted/20">
        <div className="flex h-full min-h-0 w-full flex-col gap-4 p-4 sm:p-6 lg:overflow-hidden lg:px-8">
          <section className="shrink-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
              <p className={SECTION_LABEL_CLASS}>Class Code</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsClassCodeCollapsed((current) => !current)}
              >
                {isClassCodeCollapsed ? (
                  <ChevronDown className="mr-1 h-3 w-3" />
                ) : (
                  <ChevronUp className="mr-1 h-3 w-3" />
                )}
                {isClassCodeCollapsed ? "Expand" : "Shrink"}
              </Button>
            </div>

            {isClassCodeCollapsed ? (
              <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
                <p className="font-mono text-2xl font-black tracking-[0.24em] text-foreground sm:text-3xl">
                  {joinCode}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                >
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
            ) : (
              <div className="grid min-h-[260px] h-full gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
                <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-4 text-center md:mx-0 md:items-start md:text-left">
                  <div className="space-y-3">
                    <p className="font-mono text-5xl leading-none font-black tracking-[0.3em] text-foreground sm:text-6xl">
                      {joinCode}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                    >
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
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground/90">
                      Scan the QR code or visit this link to join.
                    </p>
                    <p className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs leading-snug text-muted-foreground">
                      {joinUrl || "Preparing join link..."}
                    </p>
                  </div>
                </div>

                <div className="mx-auto flex h-full w-full max-w-[320px] items-center justify-center">
                  <QRCodeSVG
                    value={joinUrl || joinCode}
                    size={260}
                    level="M"
                    includeMargin
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
              </div>
            )}
          </section>

          <div className="grid min-h-0 flex-1 gap-4 overflow-hidden grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-full min-h-0 overflow-hidden rounded-xl border bg-card">
              <StudentList
                students={students ?? []}
                onKickStudent={handleKickStudent}
                kickingStudentId={kickingStudentId}
              />
            </aside>

            <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
              <MessageFeed
                messages={recentMessages ?? []}
                students={students ?? []}
              />

              <div className="space-y-3 border-t bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <span className={cn(SECTION_LABEL_CLASS, "shrink-0")}>
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
                <p className="text-xs text-muted-foreground">
                  {promptTypeMeta[promptType].description}
                </p>

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
