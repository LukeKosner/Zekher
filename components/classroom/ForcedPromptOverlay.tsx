"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Megaphone } from "lucide-react";

interface ForcedPrompt {
  _id: Id<"forcedPrompts">;
  promptText: string;
  sentAt: number;
}

export function ForcedPromptOverlay({
  prompt,
  studentId,
  sessionToken,
  onAskAboutThis,
}: {
  prompt: ForcedPrompt;
  studentId: Id<"students">;
  sessionToken: string;
  onAskAboutThis: (text: string) => void;
}) {
  const ackPrompt = useMutation(api.forcedPrompts.ackForcedPrompt);

  const handleRespond = async () => {
    await ackPrompt({
      promptId: prompt._id,
      studentId,
      sessionToken,
    });
    onAskAboutThis(prompt.promptText);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Teacher Interrupt
          </CardTitle>
          <CardDescription>
            Your teacher asked everyone to respond to this prompt.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            {prompt.promptText}
          </p>

          <Button onClick={handleRespond} size="sm">
            Respond now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
