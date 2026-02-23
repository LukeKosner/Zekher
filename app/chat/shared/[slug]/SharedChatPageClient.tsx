"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  AIReasoningContent,
  AIReasoningTrigger
} from "@/components/ui/kibo-ui/ai/reasoning";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib";
import { ToolInvocation } from "../../components/ToolInvocation";
import { motion } from "motion/react";

type SharedMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  parts: Array<any>;
  createdAt: number;
};

export function SharedChatPageClient({
  messages
}: {
  messages: SharedMessage[];
}) {
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setAboutOpen(true);
  }, []);

  const renderSharedActions = () => (
    <motion.div
      className="mb-3 rounded-lg border bg-muted/30 px-3 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Read-only shared chat.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/">Learn more</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/chat">Start your own chat</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
      <div className="relative flex h-full max-w-full min-h-0 flex-col">
        {messages.length === 0 ? (
          <>
            <div className="px-4 pb-2 pt-4 md:px-6">
              {renderSharedActions()}
            </div>
            <motion.div
              className="flex flex-1 items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.24, ease: "easeOut", delay: 0.08 }}
            >
              <p className="text-sm text-muted-foreground">
                No messages found in this shared chat.
              </p>
            </motion.div>
          </>
        ) : (
          <AIConversation className="flex-1 min-h-0" initial={false}>
            <AIConversationContent>
              {renderSharedActions()}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
              >
                {messages.map((message, index) => {
                  const messageId = `${message.createdAt}-${index}`;
                  const isUser = message.role === "user";
                  const prevMessage = messages[index - 1];
                  const isNewConversationTurn =
                    !prevMessage || prevMessage.role !== message.role;
                  const marginClass =
                    isNewConversationTurn && index > 0 ? "mt-4" : "";

                  if (
                    message.role === "assistant" &&
                    Array.isArray(message.parts) &&
                    message.parts.length > 0
                  ) {
                    const renderedParts: React.ReactElement[] = [];

                    message.parts.forEach((part, partIndex) => {
                      if (!part || !part.type) return;

                      if (
                        part.type === "text" &&
                        part.text &&
                        part.text.trim().length > 0
                      ) {
                        const textSegments = part.text
                          .split("\n\n")
                          .filter(
                            (segment: string) => segment.trim().length > 0
                          );

                        textSegments.forEach(
                          (segment: string, segmentIndex: number) => {
                            renderedParts.push(
                              <AIMessage
                                from="assistant"
                                key={`${messageId}-text-${partIndex}-${segmentIndex}`}
                              >
                                <AIMessageContent>
                                  <AIResponse>{segment.trim()}</AIResponse>
                                </AIMessageContent>
                              </AIMessage>
                            );
                          }
                        );
                        return;
                      }

                      if (
                        part.type === "reasoning" &&
                        part.text &&
                        part.text.trim().length > 0
                      ) {
                        let reasoningText = part.text;
                        reasoningText = reasoningText.replace(
                          /\\n\\n/g,
                          "\n\n"
                        );
                        reasoningText = reasoningText.replace(/\\n/g, "\n");
                        reasoningText = reasoningText.replace(
                          /\[([^\]]+)\]\([^)]+\)/g,
                          "$1"
                        );

                        renderedParts.push(
                          <AIMessage
                            from="assistant"
                            key={`${messageId}-reasoning-${partIndex}`}
                          >
                            <AIReasoning
                              isStreaming={false}
                              defaultOpen={false}
                            >
                              <AIReasoningTrigger />
                              <AIReasoningContent>
                                {reasoningText}
                              </AIReasoningContent>
                            </AIReasoning>
                          </AIMessage>
                        );
                        return;
                      }

                      if (
                        typeof part.type === "string" &&
                        part.type.startsWith("tool-")
                      ) {
                        const toolElement = (
                          <ToolInvocation
                            key={`${messageId}-tool-${partIndex}`}
                            part={part}
                            messageId={messageId}
                            partIndex={partIndex}
                          />
                        );
                        if (toolElement) {
                          renderedParts.push(toolElement);
                        }
                      }
                    });

                    if (
                      renderedParts.length === 0 &&
                      message.content.trim().length > 0
                    ) {
                      renderedParts.push(
                        <AIMessage
                          from="assistant"
                          key={`${messageId}-fallback`}
                        >
                          <AIMessageContent>
                            <AIResponse>{message.content.trim()}</AIResponse>
                          </AIMessageContent>
                        </AIMessage>
                      );
                    }

                    return (
                      <div
                        key={messageId}
                        className={cn("flex flex-col", marginClass)}
                      >
                        {renderedParts}
                      </div>
                    );
                  }

                  const content = message.content?.trim();
                  if (!content) return null;

                  return (
                    <div key={messageId} className={marginClass}>
                      <AIMessage from={isUser ? "user" : "assistant"}>
                        <AIMessageContent>
                          {isUser ? (
                            content
                          ) : (
                            <AIResponse>{content}</AIResponse>
                          )}
                        </AIMessageContent>
                      </AIMessage>
                    </div>
                  );
                })}
              </motion.div>
            </AIConversationContent>
            <AIConversationScrollButton />
          </AIConversation>
        )}

        <DialogContent
          showCloseButton={false}
          className="z-[100] w-[min(94vw,34rem)]"
        >
          <DialogHeader>
            <DialogTitle className="text-base">Welcome to Zekher</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Zekher supports Holocaust education with AI-powered answers
              grounded in authoritative sources and survivor testimony. This
              shared chat is read-only and may contain inaccurate information.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Understood
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
}
