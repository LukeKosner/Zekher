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
import { ToolInvocation } from "./components/ToolInvocation";
import { HolocaustImageSlideshow } from "@/app/chat/components/HolocaustImageSlideshow";
import { generateSourceUrl, cn } from "@/lib";
import { BookOpenCheck, Users, History, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as Sentry from "@sentry/nextjs";
import { ChatError } from "./components/ChatError";
import type { CustomUIMessage } from "@/app/api/chat/types";

const { logger } = Sentry;

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
  const [contentFilterData, setContentFilterData] = useState<any>(null);

  const { messages, sendMessage, status, stop, error } =
    useChat<CustomUIMessage>({
      maxSteps: 3,
      onError: (err) => {
        logger.error("Chat error occurred", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        Sentry.captureException(err, {
          tags: { component: "chat", operation: "useChat" }
        });
      },
      onData: (dataPart) => {
        // Handle streaming content-filter data
        if (dataPart.type === "data-contentFilter") {
          console.log("Content filter detected:", dataPart.data);
          setContentFilterData(dataPart.data);
        }
      }
    });

  const [input, setInput] = useState("");

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (trimmedInput && trimmedInput.length > 0) {
      // Prevent duplicate messages
      const recentUserMessages = messages
        .filter((msg) => msg.role === "user")
        .slice(-3)
        .map(
          (msg) => (msg as any).parts?.[0]?.text || (msg as any).content || ""
        );

      if (!recentUserMessages.includes(trimmedInput)) {
        try {
          sendMessage({ text: trimmedInput });
          setInput("");
          setContentFilterData(null); // Clear any previous content filter data
        } catch (error) {
          logger.error("Failed to send message", {
            error: error instanceof Error ? error.message : String(error),
            inputLength: trimmedInput.length
          });
          Sentry.captureException(error, {
            tags: { component: "chat", operation: "sendMessage" }
          });
        }
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

  return (
    <div className="relative flex h-full w-full flex-col min-h-0">
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
                const prevMessage = messages[index - 1];
                const isNewConversationTurn =
                  !prevMessage || prevMessage.role !== message.role;
                const marginClass =
                  isNewConversationTurn && index > 0 ? "mt-4" : "";

                // Handle structured assistant messages with parts
                if (
                  !isUser &&
                  Array.isArray(message.parts) &&
                  message.parts.length > 0
                ) {
                  const renderedParts: React.ReactElement[] = [];

                  message.parts.forEach((part, partIndex) => {
                    // Skip empty or invalid parts
                    if (!part || !part.type) return;

                    if (
                      part.type === "text" &&
                      part.text &&
                      part.text.trim().length > 0
                    ) {
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
                    } else if (
                      part.type === "reasoning" &&
                      part.text &&
                      part.text.trim().length > 0
                    ) {
                      const isReasoningStreaming =
                        (part as any).state !== "done" &&
                        status === "streaming";
                      const reasoningCount = message.parts
                        .slice(0, partIndex)
                        .filter((p) => p.type === "reasoning").length;
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
                              delay: reasoningCount * 0.15
                            }}
                          >
                            <AIReasoning
                              isStreaming={isReasoningStreaming}
                              defaultOpen={false}
                            >
                              <AIReasoningTrigger />
                              <AIReasoningContent>
                                {part.text}
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

                  return (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn("flex flex-col", marginClass)}
                    >
                      {renderedParts}
                    </motion.div>
                  );
                }

                // Regular messages - validate content exists
                const userContent = isUser
                  ? (
                      (message as any).parts?.[0]?.text ||
                      (message as any).content ||
                      ""
                    ).trim()
                  : "";
                const assistantContent = !isUser
                  ? (
                      (message as any).parts?.[0]?.text ||
                      (message as any).content ||
                      ""
                    ).trim()
                  : "";

                // Skip messages with no content
                if (
                  (isUser && !userContent) ||
                  (!isUser && !assistantContent)
                ) {
                  return null;
                }

                return (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={marginClass}
                  >
                    <AIMessage from={isUser ? "user" : "assistant"}>
                      <AIMessageContent>
                        {isUser
                          ? userContent
                          : (() => {
                              const isError = isErrorContent(assistantContent);

                              return isError ? (
                                renderErrorContent(assistantContent)
                              ) : (
                                <AIResponse>{assistantContent}</AIResponse>
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

      {(error || contentFilterData) && (
        <div className="px-4 pt-4">
          <ChatError error={error} contentFilterData={contentFilterData} />
        </div>
      )}

      <motion.div
        className="grid shrink-0 gap-4 pt-4 border-t border-border"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      >
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
      </motion.div>
    </div>
  );
}

// Loading component for Suspense fallback
function ChatLoading() {
  return (
    <div className="relative flex h-full w-full flex-col min-h-0">
      <motion.div
        className="flex-1 flex items-center justify-center px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
      </motion.div>

      <motion.div
        className="grid shrink-0 gap-4 pt-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      >
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
      </motion.div>
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
