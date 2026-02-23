"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  X,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { MAIN_CHAT_SUGGESTIONS } from "@/app/chat/constants";

const TOPIC_PRESETS = [
  "Rise of Nazism",
  "The Nuremberg Trials",
  "Jewish resistance",
  "Liberation and memory",
];
const SUGGESTED_PROMPT_PRESETS = MAIN_CHAT_SUGGESTIONS;

export default function TeacherDashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const profile = useQuery(
    api.teachers.getMyProfile,
    isAuthenticated ? {} : "skip"
  );
  const classes = useQuery(
    api.classes.getMyClasses,
    isAuthenticated && profile ? {} : "skip"
  );
  const createClass = useMutation(api.classes.createClass);
  const sendPrompt = useMutation(api.forcedPrompts.sendForcedPrompt);
  const ensureProfile = useMutation(api.teachers.ensureTeacherProfile);

  const [showCreate, setShowCreate] = useState(false);
  const [className, setClassName] = useState("");
  const [classTopic, setClassTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [classCreateError, setClassCreateError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [suggestedPromptInput, setSuggestedPromptInput] = useState("");
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  // Only redirect to auth once loading is complete and we're sure not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth?returnTo=%2Fclassroom%2Fteacher");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || profile === undefined) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleCreateProfile = async () => {
    setProfileError(null);
    setCreatingProfile(true);
    try {
      await ensureProfile({});
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to create teacher profile"
      );
    } finally {
      setCreatingProfile(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex h-full min-h-0 overflow-auto">
        <div className="mx-auto flex w-full max-w-md items-start px-4 py-8 sm:px-6 lg:px-8 md:py-12">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Enable Teacher Tools
              </CardTitle>
              <CardDescription>
                Turn on Zekher Classroom to run live class sessions for
                students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">How Zekher Classroom works</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Create a class and share the join code or join link.</li>
                  <li>Students join and ask questions in their own chat view.</li>
                  <li>You monitor activity, send prompts, and guide discussion.</li>
                </ol>
              </div>
              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}
              <Button
                type="button"
                className="w-full"
                onClick={handleCreateProfile}
                disabled={creatingProfile}
              >
                {creatingProfile ? "Turning on..." : "Turn On Teacher Tools"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const addSuggestedPrompt = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    setSuggestedPrompts((current) => {
      if (current.length >= 6) return current;
      if (
        current.some(
          (prompt) => prompt.toLowerCase() === normalized.toLowerCase()
        )
      ) {
        return current;
      }
      return [...current, normalized];
    });
    setSuggestedPromptInput("");
  };

  const removeSuggestedPrompt = (targetPrompt: string) => {
    setSuggestedPrompts((current) =>
      current.filter((prompt) => prompt !== targetPrompt)
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassCreateError(null);
    setDashboardError(null);
    setCreating(true);

    try {
      const normalizedName = className.trim();
      const normalizedTopic = classTopic.trim();
      const normalizedAssignment = assignmentPrompt.trim();
      const normalizedSuggestedPrompts = suggestedPrompts
        .map((prompt) => prompt.trim())
        .filter(Boolean)
        .slice(0, 6);

      if (!normalizedName) {
        setClassCreateError("Class name is required.");
        return;
      }

      const classId = await createClass({
        name: normalizedName,
        topic: normalizedTopic || undefined,
      });

      const seedPromptOperations = [
        ...(normalizedAssignment
          ? [
              sendPrompt({
                classId,
                promptText: normalizedAssignment,
                promptType: "assignment",
              }),
            ]
          : []),
        ...normalizedSuggestedPrompts.map((promptText) =>
          sendPrompt({
            classId,
            promptText,
            promptType: "suggested",
          })
        ),
      ];

      if (seedPromptOperations.length > 0) {
        const seedResults = await Promise.allSettled(seedPromptOperations);
        const failedCount = seedResults.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failedCount > 0 && typeof window !== "undefined") {
          sessionStorage.setItem(
            `classroom_setup_warning_${classId}`,
            `Class created, but ${failedCount} setup prompt${failedCount === 1 ? "" : "s"} failed to save.`
          );
        }
      }

      setClassName("");
      setClassTopic("");
      setAssignmentPrompt("");
      setSuggestedPrompts([]);
      setSuggestedPromptInput("");
      setShowCreate(false);
      router.push(`/classroom/teacher/class/${classId}`);
    } catch (err) {
      setClassCreateError(
        err instanceof Error ? err.message : "Failed to create class."
      );
    } finally {
      setCreating(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      setDashboardError(null);
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setDashboardError("Unable to copy the class code. Please copy manually.");
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-auto">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Create classes, monitor student activity, and guide discussions.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreate((current) => !current);
              setClassCreateError(null);
            }}
            size="sm"
          >
            {showCreate ? (
              <X className="mr-1 h-4 w-4" />
            ) : (
              <Plus className="mr-1 h-4 w-4" />
            )}
            {showCreate ? "Close" : "New Class"}
          </Button>
        </div>

        {dashboardError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {dashboardError}
          </div>
        )}

        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
              <CardDescription>
                Start a class, share the join code, and optionally preload a
                few prompts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class-name">Class Name</Label>
                  <Input
                    id="class-name"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Period 3 History"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class-topic">Topic (optional)</Label>
                  <Input
                    id="class-topic"
                    value={classTopic}
                    onChange={(e) => setClassTopic(e.target.value)}
                    placeholder="e.g. The Nuremberg Trials"
                  />
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_PRESETS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setClassTopic(topic)}
                        className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignment-prompt">
                    Opening Instructions (optional)
                  </Label>
                  <Textarea
                    id="assignment-prompt"
                    value={assignmentPrompt}
                    onChange={(e) => setAssignmentPrompt(e.target.value)}
                    placeholder="e.g. Ask questions about an aspect of the Holocaust that interests you. Use the sample prompts below."
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the first instruction students see when class starts.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggested-prompt-input">
                    Sample Prompt Buttons (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="suggested-prompt-input"
                      value={suggestedPromptInput}
                      onChange={(e) => setSuggestedPromptInput(e.target.value)}
                      placeholder="Type a sample question students can tap to send"
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        addSuggestedPrompt(suggestedPromptInput);
                      }}
                      disabled={suggestedPrompts.length >= 6}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 shrink-0"
                      onClick={() => addSuggestedPrompt(suggestedPromptInput)}
                      disabled={
                        !suggestedPromptInput.trim() ||
                        suggestedPrompts.length >= 6
                      }
                    >
                      Add
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    These appear below the student chat input as one-tap starters. Add up to 6.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <span
                        key={prompt}
                        className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                      >
                        {prompt}
                        <button
                          type="button"
                          onClick={() => removeSuggestedPrompt(prompt)}
                          className="rounded-sm p-0.5 hover:bg-muted"
                          aria-label={`Remove suggested prompt: ${prompt}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPT_PRESETS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => addSuggestedPrompt(prompt)}
                        className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        disabled={suggestedPrompts.length >= 6}
                      >
                        + {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {classCreateError && (
                  <p className="text-sm text-destructive">{classCreateError}</p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? "Creating..." : "Create Class"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreate(false);
                      setClassCreateError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {classes === undefined ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">Loading classes...</p>
            </CardContent>
          </Card>
        ) : classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Classes Yet</CardTitle>
              <CardDescription>
                Create your first class to generate a join code and start a
                live session.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {classes.map((cls) => (
              <Card key={cls._id} className="gap-4 py-4">
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-medium">{cls.name}</p>
                      {cls.topic && (
                        <p className="text-xs text-muted-foreground">
                          {cls.topic}
                        </p>
                      )}
                    </div>
                    {cls.status === "active" ? (
                      <Badge className="gap-1 bg-green-600/90 text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Ended
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {cls.studentCount} students
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        void copyCode(cls.joinCode);
                      }}
                      className="flex items-center gap-1 rounded-md px-2 py-0.5 font-mono hover:bg-muted hover:text-foreground"
                    >
                      Code: {cls.joinCode}
                      {copiedCode === cls.joinCode ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link
                      href={
                        cls.status === "active"
                          ? `/classroom/teacher/class/${cls._id}`
                          : `/classroom/teacher/class/${cls._id}/history`
                      }
                    >
                      Open
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
