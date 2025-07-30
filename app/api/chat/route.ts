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

  let lastProviderMetadata: any = null;
  let contentFilterDetected = false;

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

        console.log("🔍 Backend Step Check - onStepFinish called with finishReason:", finishReason);

        if (finishReason === "content-filter") {
          console.error("🛡️ Backend Content Filter Detection - Trigger detected in step:", {
            usage,
            providerMetadata
          });
          logger.warn("Content filtered", {
            usage,
            providerMetadata: JSON.stringify(providerMetadata, null, 2)
          });
          Sentry.captureMessage("Content filter triggered", {
            level: "warning",
            tags: { component: "api", endpoint: "chat" },
            extra: { usage, providerMetadata }
          });

          // Store metadata for later handling
          console.log("💾 Backend Step State - Storing content filter metadata for pre-check");
          lastProviderMetadata = providerMetadata;
          contentFilterDetected = true;
        }
      },
      onFinish: (result) => {
        const { finishReason, usage, providerMetadata, text } = result;

        logger.info("Chat finished", {
          finishReason,
          usage,
          textLength: text?.length || 0
        });

        console.log("✅ Backend Final Finish - onFinish called with finishReason:", finishReason);
      },
      onError: (error) => {
        console.error("🔴 Backend Stream Error - onError called:", error);
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

    // First, check if content will be filtered by consuming a bit of the stream
    console.log("🔍 Backend Pre-Check - Checking for content filter before creating response");
    
    // Wait a moment for onStepFinish to potentially detect content filter
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (contentFilterDetected && lastProviderMetadata) {
      console.log("🛡️ Backend Early Detection - Content filter detected before response creation");
      
      const contentFilterResponse = {
        error: "content_filter",
        message: `CONTENT_FILTER:${JSON.stringify({
          message: "Content has been filtered due to safety policies. Please rephrase your question and try again.",
          type: "content_filter",
          timestamp: new Date().toISOString(),
          providerMetadata: lastProviderMetadata
        })}`,
        timestamp: new Date().toISOString()
      };

      const duration = Date.now() - context.startTime;
      logApiResponse("POST", chatApiConstants.endpoint, 400, { duration });
      
      console.log("📤 Backend Response - Returning 400 content filter response to frontend");
      return new Response(JSON.stringify(contentFilterResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("🚀 Backend Stream Processing - Creating UI message stream response");
    const response = streamResult.toUIMessageStreamResponse();

    console.log("✅ Backend Stream Success - Stream response created successfully");
    const duration = Date.now() - context.startTime;
    logApiResponse("POST", chatApiConstants.endpoint, 200, { duration });
    logger.info("Chat completed", { ms: duration });

    return response;
  } catch (error) {
    // Check if this might be a content-filter error based on the stored state
    if (contentFilterDetected && lastProviderMetadata) {
      console.log("🛡️ Backend Error Recovery - Content filter error detected in catch block, returning structured response");
      
      const contentFilterResponse = {
        error: "content_filter",
        message: `CONTENT_FILTER:${JSON.stringify({
          message: "Content has been filtered due to safety policies. Please rephrase your question and try again.",
          type: "content_filter",
          timestamp: new Date().toISOString(),
          providerMetadata: lastProviderMetadata
        })}`,
        timestamp: new Date().toISOString()
      };

      const duration = Date.now() - context.startTime;
      logApiResponse("POST", chatApiConstants.endpoint, 400, { duration });
      
      console.log("📤 Backend Response - Returning 400 content filter response to frontend");
      return new Response(JSON.stringify(contentFilterResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log("🔴 Backend Generic Error - Handling non-content-filter error");
    return handleChatError(error, context);
  }
}

/**
 * Handles errors that occur during chat processing.
 */
function handleChatError(error: unknown, context: ChatApiContext): Response {
  const duration = Date.now() - context.startTime;
  const errorObj = error instanceof Error ? error : new Error(String(error));

  console.error("API Chat error:", errorObj);
  logger.error("Chat error", { error: errorObj, ms: duration });

  // Check if this is a content filter error with embedded JSON
  if (errorObj.message.startsWith("CONTENT_FILTER:")) {
    const contentFilterResponse = {
      error: "content_filter",
      message: errorObj.message, // This already contains the CONTENT_FILTER: prefix
      timestamp: new Date().toISOString()
    };

    logApiResponse("POST", chatApiConstants.endpoint, 400, { duration });
    
    return new Response(JSON.stringify(contentFilterResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

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
    message: chatApiErrors.processingError,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}
