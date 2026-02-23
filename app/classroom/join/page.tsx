"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function JoinClassPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinClass = useMutation(api.students.joinClass);

  const [joinCode, setJoinCode] = useState("");
  const [step, setStep] = useState<"code" | "name">("code");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefilledCode = searchParams.get("code");
    if (!prefilledCode) return;
    const normalizedCode = prefilledCode
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    if (normalizedCode.length !== 6) return;
    setJoinCode((current) => (current.length === 0 ? normalizedCode : current));
  }, [searchParams]);

  // Lookup class by code
  const classData = useQuery(
    api.classes.getClassByJoinCode,
    joinCode.length === 6 ? { joinCode: joinCode.toUpperCase() } : "skip"
  );

  useEffect(() => {
    if (step === "code" && joinCode.length === 6 && classData) {
      setError(null);
      setStep("name");
    }
  }, [classData, joinCode.length, step]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!classData) {
      setError("Invalid or expired class code.");
      return;
    }

    setLoading(true);
    try {
      // Generate or retrieve session token
      let sessionToken = sessionStorage.getItem(
        `classroom_token_${classData._id}`
      );
      if (!sessionToken) {
        sessionToken = crypto.randomUUID();
        sessionStorage.setItem(
          `classroom_token_${classData._id}`,
          sessionToken
        );
      }

      const studentId = await joinClass({
        classId: classData._id,
        displayName: displayName.trim(),
        sessionToken,
      });

      // Store student ID for the session
      sessionStorage.setItem(
        `classroom_student_${classData._id}`,
        studentId
      );

      router.push(`/classroom/session/${classData._id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join class"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-auto">
      <div className="mx-auto flex w-full max-w-md items-start px-4 py-8 sm:px-6 lg:px-8 md:py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Join a Class</CardTitle>
            <CardDescription>
              {step === "code"
                ? "Enter the class code from your teacher or scan the class QR code."
                : "Enter your display name to join."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              {step === "code" ? (
                <div className="space-y-2">
                  <Label htmlFor="join-code">Class Code</Label>
                  <InputOTP
                    id="join-code"
                    value={joinCode}
                    onChange={(value) => {
                      setError(null);
                      setJoinCode(
                        value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 6)
                      );
                    }}
                    maxLength={6}
                    className="w-full"
                    containerClassName="w-full"
                    required
                  >
                    <InputOTPGroup className="w-full">
                      {Array.from({ length: 6 }, (_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-11 w-auto flex-1 text-base font-mono tracking-wide"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {joinCode.length === 6 && classData === undefined && (
                    <p className="text-xs text-muted-foreground">
                      Checking class code...
                    </p>
                  )}
                  {joinCode.length === 6 && classData === null && (
                    <p className="text-xs text-destructive">
                      No active class found for this code.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    <p className="font-medium">{classData?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {joinCode}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("code");
                        setJoinCode("");
                        setDisplayName("");
                        setError(null);
                      }}
                      className="mt-2 text-xs underline hover:text-foreground"
                    >
                      Change code
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display-name">Your Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {step === "name" ? (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !displayName.trim() || !classData}
                >
                  {loading ? "Joining..." : "Join Class"}
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JoinClassPageFallback() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function JoinClassPage() {
  return (
    <Suspense fallback={<JoinClassPageFallback />}>
      <JoinClassPageContent />
    </Suspense>
  );
}
