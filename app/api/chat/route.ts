// Simplified chat route
import { lexiconTool, testimonyTool, showUsersAudio } from "@/lib/tools";
import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, UIMessage } from "ai";

import { holocaustEducatorPrompt } from "@/lib/prompts";
import { logger, logApiRequest, logApiResponse } from "@/lib/utils/logger";

export const maxDuration = 60;

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestData = await req.json();

  logApiRequest("POST", "/api/chat");
  logger.info("Chat route called", {
    messagesCount: requestData.messages?.length || 0,
    component: "chat-api"
  });

  const { messages }: { messages: UIMessage[] } = requestData;

  try {
    logger.debug("Messages received", {
      messagesCount: messages?.length || 0,
      component: "chat-api"
    });

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is missing or invalid");
    }

    const streamResult = streamText({
      model: google("gemini-2.5-pro"),
      messages: convertToModelMessages(messages),
      system: holocaustEducatorPrompt,
      providerOptions: {
        google: {
          thinkingConfig: {
            includeThoughts: true
          }
        }
      },
      tools: {
        lexiconTool,
        testimonyTool,
        showUsersAudio
      }
    });

    const response = streamResult.toUIMessageStreamResponse();

    logApiResponse("POST", "/api/chat", 200, Date.now() - startTime);
    logger.info("Chat route completed successfully", {
      duration: Date.now() - startTime,
      component: "chat-api"
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Chat route error", {
      error: error instanceof Error ? error : new Error(String(error)),
      duration,
      component: "chat-api"
    });

    logApiResponse("POST", "/api/chat", 500, duration);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message:
          "An error occurred while processing your request. Please try again."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
