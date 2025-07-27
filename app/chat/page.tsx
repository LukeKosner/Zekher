"use client";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton
} from "@/components/ui/kibo-ui/ai/conversation";
import {
  AIMessage,
  AIMessageContent
} from "@/components/ui/kibo-ui/ai/message";
import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import {
  AIReasoning,
  AIReasoningTrigger,
  AIReasoningContent
} from "@/components/ui/kibo-ui/ai/reasoning";
import {
  AIInput,
  AIInputSubmit,
  AIInputField
} from "@/components/ui/kibo-ui/ai/input";
import {
  AISuggestion,
  AISuggestions
} from "@/components/ui/kibo-ui/ai/suggestion";
import {
  AITool,
  AIToolHeader,
  AIToolContent,
  AIToolParameters
} from "@/components/ui/kibo-ui/ai/tool";
import React, { Suspense, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LexiconCarousel } from "@/app/chat/components/LexiconCarousel";
import { TestimonyCarousel } from "@/app/chat/components/TestimonyCarousel";
import { HolocaustImageSlideshow } from "@/app/chat/components/HolocaustImageSlideshow";
import { generateSourceUrl } from "@/lib";
import { BookOpenCheck, Users, History, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

// Lazy load audio player
const AudioPlayer = dynamic(
  () =>
    import("@/app/chat/components/AudioPlayer").then((mod) => ({
      default: mod.AudioPlayer
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-md" />
    ),
    ssr: false
  }
);

const suggestions = [
  "What was the Holocaust?",
  "When did the Holocaust happen?",
  "How many people were killed during the Holocaust?",
  "What were the main concentration camps?",
  "Who were the victims of the Holocaust?",
  "What was life like in the ghettos?",
  "How did the world respond to the Holocaust?",
  "What can we learn from Holocaust survivor testimonies?"
];

function ChatContent() {
  const { messages, sendMessage, status, stop } = useChat({
    maxSteps: 5,
    onError: (err) => {
      logger.error("Chat error occurred", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      Sentry.captureException(err, {
        tags: { component: "chat", operation: "useChat" }
      });
    }
  });

  const [input, setInput] = useState("");

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (trimmedInput) {
      // Prevent duplicate messages
      const recentUserMessages = messages
        .filter((msg) => msg.role === "user")
        .slice(-3)
        .map(
          (msg) => (msg as any).parts?.[0]?.text || (msg as any).content || ""
        );

      if (!recentUserMessages.includes(trimmedInput)) {
        sendMessage({ text: trimmedInput });
        setInput("");
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  // Helper functions
  const isErrorContent = (text: string) => {
    return (
      text.includes("<ctrl46>") ||
      text.toLowerCase().includes("error:") ||
      text.toLowerCase().includes("failed:") ||
      text.toLowerCase().includes("exception:")
    );
  };

  const renderErrorContent = (text: string) => {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-3">
        <div className="flex items-start gap-2">
          <div className="text-red-600 dark:text-red-400 text-xs font-medium">
            Error
          </div>
        </div>
        <div className="text-red-700 dark:text-red-300 text-sm mt-1 font-mono whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  };

  const getToolDisplay = (toolName: string) => {
    switch (toolName) {
      case "lexiconTool":
        return {
          icon: <History size={18} />,
          displayName: "Holocaust Lexicon"
        };
      case "testimonyTool":
        return {
          icon: <Users size={18} />,
          displayName: "Survivor Testimonies"
        };
      case "showUsersAudio":
        return {
          icon: <AudioWaveform size={18} />,
          displayName: "Audio Selections"
        };
      default:
        return { icon: <BookOpenCheck size={18} />, displayName: toolName };
    }
  };

  const hasAudioSegments = (result: any) => {
    return (
      result &&
      typeof result === "object" &&
      (result.type === "audio_segments" || Array.isArray(result.segments))
    );
  };

  const renderToolResult = (toolInvocation: any): React.ReactNode => {
    if (toolInvocation.state !== "result") return null;

    const resultData = toolInvocation.result;
    const isLexiconResult = resultData?.entries?.some(
      (e: any) => e.title && !e.survivorName
    );
    const isTestimonyResult = resultData?.entries?.some(
      (e: any) => e.survivorName
    );

    return (
      <AIToolContent>
        <AIToolParameters parameters={toolInvocation.args || {}} />
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Results
          </h4>
          <div className="rounded-md bg-muted/50 p-3">
            {isLexiconResult && (
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs font-medium">
                  Found{" "}
                  {toolInvocation.result.totalResults ||
                    toolInvocation.result.entries.length}{" "}
                  lexicon entries:
                </div>
                {toolInvocation.result.entries.map(
                  (entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs bg-background rounded p-2 border"
                    >
                      <div className="font-medium text-foreground">
                        <a
                          href={generateSourceUrl({
                            pageType: "lexicon",
                            filename: entry.id || entry.filename
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {entry.title}
                        </a>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {isTestimonyResult && (
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs font-medium">
                  Found {resultData.totalResults} testimonies:
                </div>
                {resultData.entries.map((testimony: any, idx: number) => (
                  <div
                    key={idx}
                    className="text-xs bg-background rounded p-2 border"
                  >
                    <div className="font-medium text-foreground">
                      <a
                        href={generateSourceUrl({
                          pageType: "testimony",
                          filename: testimony.id || testimony.filename
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {testimony.survivorName}
                      </a>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {testimony.location && `${testimony.location}`}
                      {testimony.location && testimony.timeReference && ` • `}
                      {testimony.timeReference && `${testimony.timeReference}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLexiconResult && !isTestimonyResult && (
              <div className="text-xs text-muted-foreground">
                {typeof resultData === "string"
                  ? resultData
                  : "Tool executed successfully"}
              </div>
            )}
          </div>
        </div>
      </AIToolContent>
    );
  };

  const renderToolInvocation = (
    part: any,
    messageId: string,
    partIndex: number
  ): React.ReactElement | null => {
    const isToolPart =
      typeof part.type === "string" && part.type.startsWith("tool-");
    if (!isToolPart) return null;

    const toolName = part.type.replace("tool-", "");
    const toolInvocation = {
      toolCallId: part.toolCallId,
      state:
        part.state === "output-available" ? "result" : part.state || "call",
      args: part.input || {},
      result: part.output
    };

    const toolDisplay = getToolDisplay(toolName);

    // Handle audio segments specially
    if (
      toolName === "showUsersAudio" &&
      (toolInvocation.state === "result" ||
        part.state === "output-available" ||
        part.output) &&
      hasAudioSegments(toolInvocation.result || part.output)
    ) {
      const resultData = toolInvocation.result || part.output;
      const audioData = {
        type: resultData.type || "audio_segments",
        segments: resultData.segments || resultData
      };

      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <AITool status="completed" defaultOpen={true}>
            <AIToolHeader
              name={toolDisplay.displayName}
              status="completed"
              icon={
                <span className="size-4 text-muted-foreground">
                  {toolDisplay.icon}
                </span>
              }
            />
            <AIToolContent>
              <div className="space-y-4">
                {audioData.segments.map((segment: any, segIdx: number) => (
                  <ErrorBoundary
                    key={`audio-${segIdx}`}
                    componentName="AudioPlayer"
                    fallback={
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Audio player unavailable.
                          <br />
                          <span className="font-medium">Transcript:</span>{" "}
                          {segment.transcriptExcerpt}
                          <br />
                          <span className="font-medium">Audio File:</span>{" "}
                          {segment.audioFile}
                        </p>
                      </div>
                    }
                  >
                    <AudioPlayer segment={segment} />
                  </ErrorBoundary>
                ))}
              </div>
            </AIToolContent>
          </AITool>
        </AIMessage>
      );
    }

    // Handle lexicon and testimony tools with carousels
    if (toolName === "lexiconTool") {
      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <LexiconCarousel
            status={toolInvocation.state}
            name={toolDisplay.displayName}
            sources={toolInvocation.result?.entries || []}
          />
        </AIMessage>
      );
    }

    if (toolName === "testimonyTool") {
      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <TestimonyCarousel
            status={toolInvocation.state}
            name={toolDisplay.displayName}
            sources={toolInvocation.result?.entries || []}
          />
        </AIMessage>
      );
    }

    // Handle other tools with standard UI
    if (toolName === "showUsersAudio" && toolInvocation.state !== "result") {
      const isRunning =
        toolInvocation.state === "call" ||
        toolInvocation.state === "partial-call" ||
        (!toolInvocation.state && !toolInvocation.result);

      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <AITool
            status={
              isRunning
                ? "running"
                : toolInvocation.state === "result"
                  ? "completed"
                  : "pending"
            }
            defaultOpen={true}
          >
            <AIToolHeader
              name={toolDisplay.displayName}
              status={
                isRunning
                  ? "running"
                  : toolInvocation.state === "result"
                    ? "completed"
                    : "pending"
              }
              icon={
                <span className="size-4 text-muted-foreground">
                  {toolDisplay.icon}
                </span>
              }
            />
            <AIToolContent>
              {isRunning ? (
                Object.keys(toolInvocation.args || {}).length > 0 ? (
                  <AIToolParameters parameters={toolInvocation.args || {}} />
                ) : (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    Selecting relevant audio segments...
                  </div>
                )
              ) : toolInvocation.state === "result" ? (
                renderToolResult(toolInvocation)
              ) : (
                <div className="text-xs text-muted-foreground">
                  Tool in unknown state: {toolInvocation.state || "undefined"}
                </div>
              )}
            </AIToolContent>
          </AITool>
        </AIMessage>
      );
    }

    // Handle showUsersAudio tool that completed but doesn't have audio segments
    if (toolName === "showUsersAudio" && toolInvocation.state === "result") {
      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <AITool status="completed" defaultOpen={true}>
            <AIToolHeader
              name={toolDisplay.displayName}
              status="completed"
              icon={
                <span className="size-4 text-muted-foreground">
                  {toolDisplay.icon}
                </span>
              }
            />
            <AIToolContent>{renderToolResult(toolInvocation)}</AIToolContent>
          </AITool>
        </AIMessage>
      );
    }

    return null;
  };

  return (
    <div className="relative flex h-full w-full flex-col divide-y min-h-0">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <HolocaustImageSlideshow onQuestionClick={handleQuestionClick} />
        </div>
      ) : (
        <AIConversation className="flex-1 min-h-0">
          <AIConversationContent>
            <AnimatePresence>
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                // Handle structured assistant messages with parts
                if (!isUser && Array.isArray(message.parts)) {
                  const renderedParts: React.ReactElement[] = [];

                  message.parts.forEach((part, partIndex) => {
                    if (part.type === "text") {
                      // Split text on double newlines to create separate bubbles
                      const textSegments = part.text
                        .split("\n\n")
                        .filter((segment) => segment.trim().length > 0);

                      textSegments.forEach((segment, segmentIndex) => {
                        const trimmedSegment = segment.trim();
                        const isError = isErrorContent(trimmedSegment);

                        renderedParts.push(
                          <AIMessage
                            from="assistant"
                            key={`${message.id}-text-${partIndex}-${segmentIndex}`}
                          >
                            <AIMessageContent>
                              {isError ? (
                                renderErrorContent(trimmedSegment)
                              ) : (
                                <AIResponse>{trimmedSegment}</AIResponse>
                              )}
                            </AIMessageContent>
                          </AIMessage>
                        );
                      });
                    } else if (part.type === "reasoning") {
                      const isReasoningStreaming =
                        (part as any).state !== "done" &&
                        status === "streaming";
                      const reasoningCount = message.parts
                        .slice(0, partIndex)
                        .filter((p) => p.type === "reasoning").length;
                      renderedParts.push(
                        <motion.div
                          key={`${message.id}-reasoning-${reasoningCount}-${part.text?.slice(0, 50)?.replace(/\s+/g, "") || partIndex}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: "easeOut",
                            delay: reasoningCount * 0.15
                          }}
                        >
                          <AIReasoning
                            isStreaming={isReasoningStreaming}
                            defaultOpen={false}
                          >
                            <AIReasoningTrigger />
                            <AIReasoningContent>{part.text}</AIReasoningContent>
                          </AIReasoning>
                        </motion.div>
                      );
                    } else if (
                      part.type !== "step-start" &&
                      typeof part.type === "string" &&
                      part.type.startsWith("tool-")
                    ) {
                      const toolElement = renderToolInvocation(
                        part,
                        message.id,
                        partIndex
                      );
                      if (toolElement) {
                        renderedParts.push(toolElement);
                      }
                    }
                  });

                  return (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-col gap-3"
                    >
                      {renderedParts}
                    </motion.div>
                  );
                }

                // Regular messages
                return (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <AIMessage from={isUser ? "user" : "assistant"}>
                      <AIMessageContent>
                        {isUser
                          ? (message as any).parts?.[0]?.text ||
                            (message as any).content ||
                            ""
                          : (() => {
                              const content =
                                (message as any).parts?.[0]?.text ||
                                (message as any).content ||
                                "";
                              const isError = isErrorContent(content);

                              return isError ? (
                                renderErrorContent(content)
                              ) : (
                                <AIResponse>{content}</AIResponse>
                              );
                            })()}
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

      <div className="grid shrink-0 gap-4 pt-4">
        <AISuggestions className="px-4">
          {suggestions.map((suggestion) => (
            <AISuggestion
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </AISuggestions>

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
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Zekher is in beta and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ChatLoading() {
  return (
    <div className="relative flex h-full w-full flex-col divide-y min-h-0">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
      </div>

      <div className="grid shrink-0 gap-4 pt-4">
        <AISuggestions className="px-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-48" />
          ))}
        </AISuggestions>

        <div className="w-full px-4 pb-4">
          <Skeleton className="h-14 w-full rounded-lg" />
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Zekher is in beta and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main export - fits perfectly into layout's main content area
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatContent />
    </Suspense>
  );
}
