import { lexiconTool, testimonyTool, showUsersAudio } from "@/lib/tools";
import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  hasToolCall,
  createUIMessageStream,
  createUIMessageStreamResponse
} from "ai";
import { holocaustEducatorPrompt } from "./prompts";
import { chatApiConstants, chatApiErrors } from "./config";
import { logger, logApiRequest, logApiResponse } from "@/lib/monitoring";
import type {
  ChatErrorResponse,
  ChatApiContext,
  CustomUIMessage
} from "./types";
import * as Sentry from "@sentry/nextjs";

export const maxDuration = 300;

/**
 * Chat API endpoint for Holocaust education conversations.
 * Provides access to lexicon search, testimony search, and audio playback tools.
 * Uses streaming responses for real-time conversation experience.
 */
export async function POST(req: Request): Promise<Response> {
  const context: ChatApiContext = {
    startTime: Date.now()
  };

  try {
    const requestData = await req.json();

    logApiRequest("POST", chatApiConstants.endpoint);
    logger.info("Chat started", { msgs: requestData.messages?.length || 0 });

    const { messages }: { messages: CustomUIMessage[] } = requestData;

    // Track tool calls to prevent duplicates within the same conversation turn
    const toolCallTracker = new Set<string>();
    // Track whether testimonyTool has been called to allow showUsersAudio
    let testimonyToolCalled = false;

    const stream = createUIMessageStream<CustomUIMessage>({
      originalMessages: messages,
      execute: ({ writer }) => {
        const result = streamText({
          model: google(chatApiConstants.modelName),
          messages: convertToModelMessages(messages),
          system: holocaustEducatorPrompt,
          onStepFinish: (result) => {
            const { finishReason, usage, providerMetadata } = result;

            if (finishReason === "content-filter") {
              logger.warn("Content filtered", { usage, providerMetadata });
              Sentry.captureMessage("Content filter triggered", {
                level: "warning",
                tags: { component: "api", endpoint: "chat" },
                extra: { usage, providerMetadata }
              });

              // Stream content-filter data instead of throwing error
              writer.write({
                type: "data-contentFilter",
                id: "content-filter-" + Date.now(),
                data: {
                  finishReason,
                  providerMetadata,
                  timestamp: new Date().toISOString(),
                  message:
                    "Your message was filtered for safety reasons. Please rephrase your question."
                }
              });
            }
          },
          onFinish: (result) => {
            const { finishReason, usage, providerMetadata } = result;

            logger.info("Chat finished", {
              finishReason,
              usage,
              providerMetadata
            });
          },
          onError: (error) => {
            logger.error("Stream error", { error });
            Sentry.captureException(error, {
              tags: { component: "api", endpoint: "chat", operation: "stream" }
            });

            throw error;
          },

          temperature: 0,
          providerOptions: {
            google: {
              thinkingConfig: { includeThoughts: true },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_ONLY_HIGH"
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_NONE"
                },
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_ONLY_HIGH"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_ONLY_HIGH"
                }
              ]
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: "chat"
          },
          tools: {
            lexiconTool: {
              ...lexiconTool,
              execute: async (params: any, options: any) => {
                const callId = `lexicon-${JSON.stringify(params)}`;
                if (toolCallTracker.has(callId)) {
                  logger.info("Duplicate lexicon tool call prevented", {
                    params
                  });
                  return {
                    error:
                      "This search was already performed in this conversation turn.",
                    entries: [],
                    formattedText: "Search already performed.",
                    nextSteps:
                      "Please ask a different question or refine your search terms."
                  };
                }
                toolCallTracker.add(callId);
                if (!lexiconTool.execute) {
                  return {
                    error: "Lexicon search is temporarily unavailable.",
                    entries: [],
                    formattedText:
                      "Search tool is not available right now. Please try asking your question again.",
                    nextSteps:
                      "Please rephrase your question or try again later."
                  };
                }
                return lexiconTool.execute(params, options);
              }
            },
            testimonyTool: {
              ...testimonyTool,
              execute: async (params: any, options: any) => {
                const callId = `testimony-${JSON.stringify(params)}`;
                if (toolCallTracker.has(callId)) {
                  logger.info("Duplicate testimony tool call prevented", {
                    params
                  });
                  return {
                    error:
                      "This search was already performed in this conversation turn.",
                    entries: [],
                    formattedText: "Search already performed.",
                    nextSteps:
                      "Please ask a different question or refine your search terms."
                  };
                }
                toolCallTracker.add(callId);
                // Mark that testimonyTool has been called
                testimonyToolCalled = true;
                if (!testimonyTool.execute) {
                  return {
                    error: "Testimony search is temporarily unavailable.",
                    entries: [],
                    formattedText:
                      "Search tool is not available right now. Please try asking your question again.",
                    nextSteps:
                      "Please rephrase your question or try again later."
                  };
                }
                return testimonyTool.execute(params, options);
              }
            },
            showUsersAudio: {
              ...showUsersAudio,
              execute: async (params: any, options: any) => {
                const callId = `audio-${JSON.stringify(params)}`;
                if (toolCallTracker.has(callId)) {
                  logger.info("Duplicate audio tool call prevented", {
                    params
                  });
                  return {
                    type: "audio_segments",
                    segments: [],
                    message:
                      "Audio segments were already processed in this conversation turn."
                  };
                }
                toolCallTracker.add(callId);
                if (!showUsersAudio.execute) {
                  return {
                    type: "audio_segments",
                    segments: [],
                    message:
                      "Audio tool is not available right now. Please try asking your question again."
                  };
                }
                return showUsersAudio.execute(params, options);
              }
            }
          }
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    const duration = Date.now() - context.startTime;
    logApiResponse("POST", chatApiConstants.endpoint, 200, { duration });
    logger.info("Chat completed", { ms: duration });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    return handleChatError(error, context);
  }
}

/**
 * Handles errors that occur during chat processing.
 */
function handleChatError(error: unknown, context: ChatApiContext): Response {
  const duration = Date.now() - context.startTime;
  const errorObj = error instanceof Error ? error : new Error(String(error));

  logger.error("Chat error", { error: errorObj, ms: duration });

  // Capture error in Sentry with context
  Sentry.captureException(errorObj, {
    tags: {
      component: "api",
      endpoint: "chat",
      operation: "POST"
    },
    extra: {
      duration,
      timestamp: new Date().toISOString()
    }
  });

  logApiResponse("POST", chatApiConstants.endpoint, 500, { duration });

  const errorResponse: ChatErrorResponse = {
    error: chatApiErrors.internalServerError,
    message: errorObj.message || chatApiErrors.processingError,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}
