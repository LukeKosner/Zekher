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
import { MicIcon, BookOpenCheck, Users, History } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LexiconCarousel } from "@/components/lexiconCarousel";
import { TestimonyCarousel } from "@/components/testimonyCarousel";
import { generateSourceUrl } from "@/lib/utils/url-generation";

// Lazy load audio player to reduce initial bundle size
const AudioPlayer = dynamic(
  () =>
    import("@/components/audio/AudioPlayer").then((mod) => ({
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
      console.error("Chat error:", err);
    }
  });

  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    // Prevent duplicate messages by checking against recent user messages
    const recentUserMessages = messages
      .filter((msg) => msg.role === "user")
      .slice(-3)
      .map(
        (msg) => (msg as any).parts?.[0]?.text || (msg as any).content || ""
      );

    if (trimmedInput && !recentUserMessages.includes(trimmedInput)) {
      sendMessage({ text: trimmedInput });
      setInput("");
    }
  };
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // Helper function to get icon and name for different tools
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
          icon: <MicIcon size={18} />,
          displayName: "Audio Selections"
        };
      default:
        return {
          icon: <BookOpenCheck size={18} />,
          displayName: toolName
        };
    }
  };

  // Helper function to check if a tool result contains audio segments
  const hasAudioSegments = (result: any) => {
    return (
      result &&
      typeof result === "object" &&
      (result.type === "audio_segments" || Array.isArray(result.segments))
    );
  };

  // Helper function to render structured tool results
  const renderToolResult = (toolInvocation: any): React.ReactNode => {
    if (toolInvocation.state !== "result") return null;

    const resultData = toolInvocation.result;

    const isLexiconResult =
      resultData?.entries &&
      Array.isArray(resultData.entries) &&
      resultData.entries.some((e: any) => e.title && !e.survivorName);
    const isTestimonyResult =
      resultData?.entries &&
      Array.isArray(resultData.entries) &&
      resultData.entries.some((e: any) => e.survivorName);

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
                            filename: entry.filename
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
                          filename: testimony.filename
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

        <details className="space-y-2 mt-4">
          <summary className="font-medium text-muted-foreground text-xs uppercase tracking-wide cursor-pointer hover:text-foreground">
            Raw Data
          </summary>
          <div className="rounded-md bg-muted/50 p-3">
            <pre className="overflow-x-auto text-muted-foreground text-xs">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </div>
        </details>
      </AIToolContent>
    );
  };

  // Helper function to render tool invocations
  function renderToolInvocation(
    part: any,
    messageId: string,
    partIndex: number
  ): React.ReactElement | null {
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

    // Handle audio segments tool specially
    if (
      toolName === "showUsersAudio" &&
      toolInvocation.state === "result" &&
      hasAudioSegments(toolInvocation.result)
    ) {
      const resultData = toolInvocation.result;
      const audioData = {
        type: resultData.type || "audio_segments",
        segments: resultData.segments || resultData
      };

      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <AITool status="completed">
            <AIToolHeader name={toolDisplay.displayName} status="completed" />
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

    // Handle all other tools
    if (toolName === "lexiconTool") {
      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          <LexiconCarousel
            status={toolInvocation.state}
            name={getToolDisplay(toolName).displayName}
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
            name={getToolDisplay(toolName).displayName}
            sources={toolInvocation.result?.entries || []}
          />
        </AIMessage>
      );
    }

    if (toolName === "showUsersAudio") {
      if (toolInvocation.state === "result") {
        return null; // Already rendered audio players above
      }

      return (
        <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
          {toolInvocation.state === "call" ||
          toolInvocation.state === "partial-call" ||
          (!toolInvocation.state && !toolInvocation.result) ? (
            <AITool status="running">
              <AIToolHeader name={toolDisplay.displayName} status="running" />
              <AIToolContent>
                {Object.keys(toolInvocation.args || {}).length > 0 ? (
                  <AIToolParameters parameters={toolInvocation.args || {}} />
                ) : (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    Selecting relevant audio segments...
                  </div>
                )}
              </AIToolContent>
            </AITool>
          ) : toolInvocation.state === "result" ? (
            <AITool
              status={
                typeof toolInvocation.result === "string" &&
                (toolInvocation.result.startsWith("Error processing") ||
                  toolInvocation.result.startsWith("No relevant"))
                  ? "error"
                  : "completed"
              }
            >
              <AIToolHeader
                name={toolDisplay.displayName}
                status={
                  typeof toolInvocation.result === "string" &&
                  (toolInvocation.result.startsWith("Error processing") ||
                    toolInvocation.result.startsWith("No relevant"))
                    ? "error"
                    : "completed"
                }
              />
              {renderToolResult(toolInvocation)}
            </AITool>
          ) : (
            <AITool status="pending">
              <AIToolHeader name={toolDisplay.displayName} status="pending" />
              <AIToolContent>
                <div className="text-xs text-muted-foreground">
                  Tool in unknown state: {toolInvocation.state || "undefined"}
                </div>
              </AIToolContent>
            </AITool>
          )}
        </AIMessage>
      );
    }

    return null;
  }

  return (
    <>
      {/* Main container - matches example UI structure exactly */}
      <div className="relative flex h-full w-full flex-col divide-y min-h-0">
        {/* Conversation area */}
        <AIConversation className="flex-1 min-h-0">
          <AIConversationContent>
            {messages.length !== 0 ? (
              <AnimatePresence>
                {messages.map((message, index) => {
                  const isUser = message.role === "user";

                  // Handle structured assistant messages with parts
                  if (!isUser && Array.isArray(message.parts)) {
                    const renderedParts: React.ReactElement[] = [];

                    // Process parts in chronological order
                    message.parts.forEach((part, partIndex) => {
                      if (part.type === "text") {
                        // Render text content
                        renderedParts.push(
                          <AIMessage
                            from="assistant"
                            key={`${message.id}-text-${partIndex}`}
                          >
                            <AIMessageContent>
                              <AIResponse>{part.text}</AIResponse>
                            </AIMessageContent>
                          </AIMessage>
                        );
                      } else if (part.type === "reasoning") {
                        // Render reasoning content as dropdown sections
                        // Check individual reasoning part state instead of global streaming status
                        const isReasoningStreaming =
                          (part as any).state !== "done" &&
                          status === "streaming";
                        renderedParts.push(
                          <motion.div
                            key={`${message.id}-reasoning-${partIndex}-${part.text?.slice(0, 20)}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "easeOut",
                              delay: 0.1 // Small delay to make the animation more noticeable
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
                      } else if (part.type === "step-start") {
                        // Skip step-start parts - they're just markers
                        return;
                      } else if (
                        typeof part.type === "string" &&
                        part.type.startsWith("tool-")
                      ) {
                        // Render tool invocations
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

                  // Regular messages (user messages or simple assistant messages)
                  return (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <AIMessage
                        from={isUser ? "user" : "assistant"}
                      >
                        <AIMessageContent>
                          {isUser ? (
                            (message as any).parts?.[0]?.text ||
                            (message as any).content ||
                            ""
                          ) : (
                            <AIResponse>
                              {(message as any).parts?.[0]?.text ||
                                (message as any).content ||
                                ""}
                            </AIResponse>
                          )}
                        </AIMessageContent>
                      </AIMessage>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              // Empty state - centered welcome message
              <div className="flex items-center justify-center min-h-[60vh] px-6">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
                    Ask anything about the Holocaust
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Get answers from survivor testimony and leading data sources
                  </p>
                </div>
              </div>
            )}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>

        {/* Bottom input section - matches example UI structure exactly */}
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
                onChange={handleInputChange}
                aria-label="Ask a question about the Holocaust"
              />

              <AIInputSubmit
                disabled={!input.trim() && status !== "streaming"}
                status={status}
                onClick={status === "streaming" ? stop : undefined}
              />
            </AIInput>
          </div>
        </div>
      </div>
    </>
  );
}

// Loading component for Suspense fallback
function ChatLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading chat...
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
