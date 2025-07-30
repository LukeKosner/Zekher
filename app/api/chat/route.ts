import { lexiconTool, testimonyTool, showUsersAudio } from "@/lib/tools";
import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  hasToolCall
} from "ai";
import { holocaustEducatorPrompt } from "./prompts";
import { chatApiConstants, chatApiErrors } from "./config";
import { logger, logApiRequest, logApiResponse } from "@/lib/monitoring";
import type { ChatErrorResponse, ChatApiContext } from "./types";
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

    const { messages }: { messages: UIMessage[] } = requestData;

    const streamResult = streamText({
      model: google(chatApiConstants.modelName),
      messages: convertToModelMessages(messages),
      system: holocaustEducatorPrompt,
      stopWhen: hasToolCall("showUsersAudio"),
      onStepFinish: (result) => {
        const { finishReason, usage, providerMetadata, text } = result;

        if (finishReason === "content-filter") {
          logger.warn("Content filtered", { usage, providerMetadata });
          Sentry.captureMessage("Content filter triggered", {
            level: "warning",
            tags: { component: "api", endpoint: "chat" },
            extra: { usage, providerMetadata }
          });
          
          throw new Error("There was an error processing your request or your content has been filtered. Please try rephrasing your question.");
        }
      },
      onFinish: (result) => {
        const { finishReason, usage, text } = result;

        logger.info("Chat finished", {
          finishReason,
          usage,
          textLength: text?.length || 0
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
              threshold: "BLOCK_LOW_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_LOW_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_LOW_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_LOW_AND_ABOVE"
            }
          ]
        }
      },
      tools: {
        lexiconTool,
        testimonyTool,
        showUsersAudio
      }
    });

    const response = streamResult.toUIMessageStreamResponse();

    const duration = Date.now() - context.startTime;
    logApiResponse("POST", chatApiConstants.endpoint, 200, { duration });
    logger.info("Chat completed", { ms: duration });

    return response;
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
