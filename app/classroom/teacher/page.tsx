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
  const ensureProfile = useMutation(api.teachers.ensureTeacherProfile);

  const [showCreate, setShowCreate] = useState(false);
  const [className, setClassName] = useState("");
  const [classTopic, setClassTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const classId = await createClass({
        name: className,
        topic: classTopic || undefined,
      });
      setClassName("");
      setClassTopic("");
      setShowCreate(false);
      router.push(`/classroom/teacher/class/${classId}`);
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            {showCreate ? (
              <X className="mr-1 h-4 w-4" />
            ) : (
              <Plus className="mr-1 h-4 w-4" />
            )}
            {showCreate ? "Close" : "New Class"}
          </Button>
        </div>

        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
              <CardDescription>
                Start a live classroom session and share the join code with
                students.
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
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? "Creating..." : "Create Class"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreate(false)}
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
                      onClick={() => copyCode(cls.joinCode)}
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
