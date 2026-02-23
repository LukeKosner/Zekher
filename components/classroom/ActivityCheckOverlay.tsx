"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleAlert } from "lucide-react";

interface ActivityCheck {
  _id: Id<"activityChecks">;
  question: string;
  sentAt: number;
}

export function ActivityCheckOverlay({
  check,
  studentId,
  sessionToken,
}: {
  check: ActivityCheck;
  studentId: Id<"students">;
  sessionToken: string;
}) {
  const respond = useMutation(api.activityChecks.respondToCheck);
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;

    await respond({
      checkId: check._id,
      studentId,
      sessionToken,
      response: response.trim(),
    });
    setSubmitted(true);
  };

  if (submitted) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert className="h-4 w-4" />
            Activity Check
          </CardTitle>
          <CardDescription>
            Your teacher requested a quick response.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium">
            {check.question}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Your answer..."
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!response.trim()}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
