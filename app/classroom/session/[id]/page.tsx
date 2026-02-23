"use client";

import { useEffect, useState, useRef, type ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useChat } from "@ai-sdk/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/components/ui/kibo-ui/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@/components/ui/kibo-ui/ai/message";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import {
  AIReasoning,
  AIReasoningTrigger,
  AIReasoningContent,
} from "@/components/ui/kibo-ui/ai/reasoning";
import {
  AIInput,
  AIInputSubmit,
  AIInputField,
} from "@/components/ui/kibo-ui/ai/input";
import {
  AISuggestion,
  AISuggestions,
} from "@/components/ui/kibo-ui/ai/suggestion";
import { ActivityCheckOverlay } from "@/components/classroom/ActivityCheckOverlay";
import { ForcedPromptOverlay } from "@/components/classroom/ForcedPromptOverlay";
import { motion, AnimatePresence } from "motion/react";
import { ToolInvocation } from "@/app/chat/components/ToolInvocation";
import { cn } from "@/lib";
import type { CustomUIMessage } from "@/app/api/chat/types";

const classroomToolLabels: Record<string, string> = {
  lexiconTool: "Lexicon search",
  testimonyTool: "Testimony search",
  showUsersAudio: "Audio search",
};

function summarizeToolPart(part: any): string {
  if (!part || typeof part.type !== "string" || !part.type.startsWith("tool-")) {
    return "";
  }

  const toolName = part.type.replace("tool-", "");
  const toolLabel = classroomToolLabels[toolName] ?? toolName;
  const state = typeof part.state === "string" ? part.state : "";
  const output = part.output;

  if (typeof output === "string" && output.trim()) {
    return output.trim();
  }

  if (output && typeof output === "object") {
    const structuredOutput = output as {
      formattedText?: string;
      message?: string;
      entries?: unknown[];
      segments?: unknown[];
    };

    if (
      typeof structuredOutput.formattedText === "string" &&
      structuredOutput.formattedText.trim()
    ) {
      return structuredOutput.formattedText.trim();
    }

    if (typeof structuredOutput.message === "string" && structuredOutput.message.trim()) {
      return structuredOutput.message.trim();
    }

    if (Array.isArray(structuredOutput.entries)) {
      const count = structuredOutput.entries.length;
      return `${toolLabel} returned ${count} result${count === 1 ? "" : "s"}.`;
    }

    if (Array.isArray(structuredOutput.segments)) {
      const count = structuredOutput.segments.length;
      return `${toolLabel} returned ${count} audio segment${count === 1 ? "" : "s"}.`;
    }
  }

  if (state === "input-available" || state === "partial-call" || state === "call") {
    return `${toolLabel} is searching...`;
  }

  if (state === "output-available") {
    return `${toolLabel} returned results.`;
  }

  return "";
}

function extractMessageContent(
  message: any,
  options?: {
    includeReasoning?: boolean;
    includeToolSummaries?: boolean;
  }
): string {
  const includeReasoning = options?.includeReasoning ?? true;
  const includeToolSummaries = options?.includeToolSummaries ?? true;
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  const extractedBlocks: string[] = [];

  for (const part of parts) {
    if (!part || typeof part !== "object") continue;

    if (part.type === "text" && typeof part.text === "string") {
      const text = part.text.trim();
      if (text) extractedBlocks.push(text);
      continue;
    }

    if (
      includeReasoning &&
      part.type === "reasoning" &&
      typeof part.text === "string"
    ) {
      const reasoning = part.text
        .replace(/\\n\\n/g, "\n\n")
        .replace(/\\n/g, "\n")
        .trim();
      if (reasoning) extractedBlocks.push(`Reasoning:\n${reasoning}`);
      continue;
    }

    if (includeToolSummaries) {
      const toolSummary = summarizeToolPart(part);
      if (toolSummary) extractedBlocks.push(toolSummary);
    }
  }

  if (extractedBlocks.length > 0) {
    return extractedBlocks.join("\n\n");
  }

  return typeof message?.content === "string" ? message.content.trim() : "";
}

export default function StudentSessionPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as Id<"classes">;

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<Id<"students"> | null>(null);
  const [input, setInput] = useState("");
  const lastMirroredRef = useRef<Set<string>>(new Set());

  // Load session from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem(`classroom_token_${classId}`);
    const sid = sessionStorage.getItem(
      `classroom_student_${classId}`
    ) as Id<"students"> | null;
    if (!token || !sid) {
      router.push("/classroom/join");
      return;
    }
    setSessionToken(token);
    setStudentId(sid);
  }, [classId, router]);

  // Convex mutations/queries
  const mirrorMessage = useMutation(api.classMessages.mirrorMessage);
  const updateLastSeen = useMutation(api.students.updateLastSeen);
  const leaveClass = useMutation(api.students.leaveClass);
  const ackForcedPrompt = useMutation(api.forcedPrompts.ackForcedPrompt);
  const activeCheck = useQuery(
    api.activityChecks.getActiveCheck,
    { classId }
  );
  const unackedPrompts = useQuery(
    api.forcedPrompts.getUnackedPrompts,
    studentId ? { classId, studentId } : "skip"
  );
  const studentRecord = useQuery(
    api.students.getStudentByToken,
    sessionToken ? { sessionToken, classId } : "skip"
  );
  const classData = useQuery(api.classes.getClassById, { classId });

  // Presence + heartbeat
  useEffect(() => {
    if (
      !studentId ||
      !sessionToken ||
      typeof window === "undefined" ||
      Boolean(studentRecord?.kickedAt)
    ) {
      return;
    }

    let intervalId: number | null = null;

    const markActive = () => {
      updateLastSeen({ studentId, sessionToken }).catch(() => {});
    };

    const markInactive = () => {
      leaveClass({ studentId, sessionToken }).catch(() => {});
    };

    const stopHeartbeat = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startHeartbeat = () => {
      stopHeartbeat();
      intervalId = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          markActive();
        }
      }, 15_000);
    };

    const handleVisibleState = () => {
      if (document.visibilityState === "visible") {
        markActive();
        startHeartbeat();
      } else {
        stopHeartbeat();
        markInactive();
      }
    };

    const handlePageHide = () => {
      markInactive();
    };

    const handleBlur = () => {
      window.setTimeout(() => {
        if (document.visibilityState !== "visible" || !document.hasFocus()) {
          markInactive();
        }
      }, 0);
    };

    handleVisibleState();
    document.addEventListener("visibilitychange", handleVisibleState);
    window.addEventListener("focus", markActive);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibleState);
      window.removeEventListener("focus", markActive);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      markInactive();
    };
  }, [studentId, sessionToken, studentRecord?.kickedAt, updateLastSeen, leaveClass]);

  // Chat via existing API
  const { messages, sendMessage, status, stop } = useChat<CustomUIMessage>({
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  // Mirror messages to Convex
  useEffect(() => {
    if (!studentId || !sessionToken) return;

    for (const msg of messages) {
      if (
        msg.id &&
        !lastMirroredRef.current.has(msg.id) &&
        (msg.role === "user" || msg.role === "assistant")
      ) {
        const content = extractMessageContent(msg, {
          includeReasoning: false,
          includeToolSummaries: true,
        });
        if (!content.trim()) continue;

        // Only mirror completed assistant messages
        if (msg.role === "assistant" && status === "streaming") continue;

        lastMirroredRef.current.add(msg.id);
        mirrorMessage({
          studentId,
          classId,
          sessionToken,
          role: msg.role as "user" | "assistant",
          content: content.substring(0, 10000), // Limit size
        }).catch(() => {});
      }
    }
  }, [messages, status, studentId, classId, sessionToken, mirrorMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleForcedPromptAsk = (promptText: string) => {
    sendMessage({ text: promptText });
  };

  const prompts = unackedPrompts ?? [];
  const interruptPrompt = prompts.find(
    (prompt) => (prompt.promptType ?? "forced") === "forced"
  );
  const assignmentPrompt = prompts.find(
    (prompt) => prompt.promptType === "assignment"
  );
  const suggestedPrompts = prompts
    .filter((prompt) => prompt.promptType === "suggested")
    .filter(
      (prompt, index, all) =>
        all.findIndex((item) => item.promptText === prompt.promptText) === index
    )
    .slice(0, 4);

  const handleSuggestedPromptClick = async (
    prompt: (typeof suggestedPrompts)[number]
  ) => {
    if (!studentId || !sessionToken) return;
    sendMessage({ text: prompt.promptText });
    await ackForcedPrompt({
      promptId: prompt._id,
      studentId,
      sessionToken,
    });
  };

  // Redirect if class ended
  if (classData && classData.status === "ended") {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-6 bg-muted/20">
        <div className="rounded-xl border bg-card px-6 py-8 text-center text-muted-foreground">
          This class has ended. Thank you for participating.
        </div>
      </div>
    );
  }

  if (studentRecord?.kickedAt) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-6 bg-muted/20">
        <div className="rounded-xl border bg-card px-6 py-8 text-center text-muted-foreground">
          You were removed from this class by your teacher.
        </div>
      </div>
    );
  }

  if (!sessionToken || !studentId) {
    return null;
  }

  return (
    <div className="relative flex h-full max-w-full min-h-0 flex-col bg-muted/20">
      {/* Activity check overlay */}
      {activeCheck && studentId && sessionToken && (
        <ActivityCheckOverlay
          check={activeCheck}
          studentId={studentId}
          sessionToken={sessionToken}
        />
      )}

      {/* Forced prompt overlay */}
      {interruptPrompt && studentId && sessionToken && (
        <ForcedPromptOverlay
          prompt={interruptPrompt}
          studentId={studentId}
          sessionToken={sessionToken}
          onAskAboutThis={handleForcedPromptAsk}
        />
      )}

      {/* Chat area */}
      {messages.length === 0 ? (
        <div className="flex flex-1 min-h-0 items-center justify-center p-6">
          <div className="max-w-lg rounded-xl border bg-card px-6 py-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {assignmentPrompt?.promptText ??
                "Start asking questions about the Holocaust."}
            </p>
            {classData?.topic && (
              <p className="text-sm text-muted-foreground">
                Today&apos;s topic: <strong>{classData.topic}</strong>
              </p>
            )}
          </div>
        </div>
      ) : (
        <AIConversation className="flex-1 min-h-0">
          <AIConversationContent>
            <AnimatePresence>
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const prevMessage = messages[index - 1];
                const isNewConversationTurn =
                  !prevMessage || prevMessage.role !== message.role;
                const marginClass =
                  isNewConversationTurn && index > 0 ? "mt-4" : "";

                if (
                  !isUser &&
                  Array.isArray(message.parts) &&
                  message.parts.length > 0
                ) {
                  const renderedParts: ReactElement[] = [];

                  (message.parts || []).forEach((part, partIndex) => {
                    if (!part || !part.type) return;

                    if (
                      part.type === "text" &&
                      part.text &&
                      part.text.trim().length > 0
                    ) {
                      const textSegments = part.text
                        .split("\n\n")
                        .filter((segment) => segment.trim().length > 0);

                      textSegments.forEach((segment, segmentIndex) => {
                        renderedParts.push(
                          <AIMessage
                            from="assistant"
                            key={`${message.id}-text-${partIndex}-${segmentIndex}`}
                          >
                            <AIMessageContent>
                              <AIResponse>{segment.trim()}</AIResponse>
                            </AIMessageContent>
                          </AIMessage>
                        );
                      });
                    } else if (
                      part.type === "reasoning" &&
                      part.text &&
                      part.text.trim().length > 0
                    ) {
                      const isReasoningStreaming =
                        (part as any).state !== "done" &&
                        status === "streaming";
                      const reasoningCount = (message.parts || [])
                        .slice(0, partIndex)
                        .filter((p) => p.type === "reasoning").length;

                      let reasoningText = part.text;
                      reasoningText = reasoningText.replace(/\\n\\n/g, "\n\n");
                      reasoningText = reasoningText.replace(/\\n/g, "\n");
                      reasoningText = reasoningText.replace(
                        /\[([^\]]+)\]\([^)]+\)/g,
                        "$1"
                      );

                      renderedParts.push(
                        <AIMessage
                          from="assistant"
                          key={`${message.id}-reasoning-${partIndex}`}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: "easeOut",
                              delay: reasoningCount * 0.15,
                            }}
                            style={{ willChange: "transform, opacity" }}
                          >
                            <AIReasoning
                              isStreaming={isReasoningStreaming}
                              defaultOpen={false}
                            >
                              <AIReasoningTrigger />
                              <AIReasoningContent>
                                {reasoningText}
                              </AIReasoningContent>
                            </AIReasoning>
                          </motion.div>
                        </AIMessage>
                      );
                    } else if (
                      part.type !== "step-start" &&
                      typeof part.type === "string" &&
                      part.type.startsWith("tool-")
                    ) {
                      const toolElement = (
                        <ToolInvocation
                          key={`${message.id}-tool-${partIndex}`}
                          part={part}
                          messageId={message.id}
                          partIndex={partIndex}
                        />
                      );

                      if (toolElement) {
                        renderedParts.push(toolElement);
                      }
                    }
                  });

                  if (renderedParts.length === 0) return null;

                  return (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn("flex flex-col", marginClass)}
                      style={{ willChange: "transform, opacity" }}
                    >
                      {renderedParts}
                    </motion.div>
                  );
                }

                const content = extractMessageContent(message);
                if (!content.trim()) return null;

                return (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={marginClass}
                    style={{ willChange: "transform, opacity" }}
                  >
                    <AIMessage from={isUser ? "user" : "assistant"}>
                      <AIMessageContent>
                        {isUser ? (
                          content
                        ) : (
                          <AIResponse>{content}</AIResponse>
                        )}
                      </AIMessageContent>
                    </AIMessage>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
      )}

      <motion.div
        className="grid shrink-0 gap-4 border-t border-border pt-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {suggestedPrompts.length > 0 && (
          <AISuggestions className="px-4">
            {suggestedPrompts.map((prompt) => (
              <AISuggestion
                key={prompt._id}
                suggestion={prompt.promptText}
                onClick={() => {
                  void handleSuggestedPromptClick(prompt);
                }}
              />
            ))}
          </AISuggestions>
        )}

        <div className="w-full px-4 pb-4">
          <AIInput onSubmit={handleSubmit}>
            <AIInputField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Ask a question about the Holocaust"
            />
            <AIInputSubmit
              disabled={!input.trim() && status !== "streaming"}
              status={status}
              onClick={status === "streaming" ? stop : undefined}
            />
          </AIInput>
        </div>
      </motion.div>
    </div>
  );
}
