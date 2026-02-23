import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessageChunk,
} from "ai";
import type { ChatErrorResponse, CustomUIMessage } from "./types";
import { chatApiErrors } from "./config";

export const maxDuration = 300;

function normalizeClientSessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 128);
}

function isRateLimitError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate_limit:") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes(" 429")
  );
}

function toToolName(partType: string): string {
  return partType.replace(/^tool-/, "");
}

function buildAssistantChunks(
  messageId: string,
  parts: any[],
  threadId: string
): Array<UIMessageChunk> {
  const chunks: Array<UIMessageChunk> = [];
  chunks.push({
    type: "data-thread" as any,
    id: `thread-${messageId}`,
    data: { threadId },
  });
  chunks.push({ type: "start", messageId });
  chunks.push({ type: "start-step" });

  for (const part of parts) {
    if (!part || typeof part !== "object") continue;

    if (part.type === "text" && typeof part.text === "string") {
      chunks.push({ type: "text-start", id: `${messageId}-text` });
      chunks.push({
        type: "text-delta",
        id: `${messageId}-text`,
        delta: part.text,
      });
      chunks.push({ type: "text-end", id: `${messageId}-text` });
      continue;
    }

    if (part.type === "reasoning" && typeof part.text === "string") {
      chunks.push({ type: "reasoning-start", id: `${messageId}-reasoning` });
      chunks.push({
        type: "reasoning-delta",
        id: `${messageId}-reasoning`,
        delta: part.text,
      });
      chunks.push({ type: "reasoning-end", id: `${messageId}-reasoning` });
      continue;
    }

    if (typeof part.type === "string" && part.type.startsWith("tool-")) {
      const toolName = toToolName(part.type);
      const toolCallId =
        typeof part.toolCallId === "string"
          ? part.toolCallId
          : `${messageId}-${toolName}`;
      chunks.push({
        type: "tool-input-available",
        toolCallId,
        toolName,
        input: part.input ?? {},
      });
      if (typeof part.output !== "undefined") {
        chunks.push({
          type: "tool-output-available",
          toolCallId,
          output: part.output,
        });
      }
    }
  }

  chunks.push({ type: "finish-step" });
  chunks.push({ type: "finish" });
  return chunks;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const convexSiteUrl =
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
      (convexUrl?.includes(".convex.cloud")
        ? convexUrl.replace(".convex.cloud", ".convex.site")
        : undefined);
    if (!convexUrl && !convexSiteUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
    }

    const rawBody = await req.text();
    if (!rawBody.trim()) {
      const errorResponse: ChatErrorResponse = {
        error: chatApiErrors.invalidRequest,
        message: chatApiErrors.missingMessages,
        timestamp: new Date().toISOString(),
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let requestData: any;
    try {
      requestData = JSON.parse(rawBody);
    } catch {
      const errorResponse: ChatErrorResponse = {
        error: chatApiErrors.invalidRequest,
        message: "Request body must be valid JSON",
        timestamp: new Date().toISOString(),
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(requestData?.messages)) {
      const errorResponse: ChatErrorResponse = {
        error: chatApiErrors.invalidMessages,
        message: chatApiErrors.invalidMessages,
        timestamp: new Date().toISOString(),
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authorization = req.headers.get("authorization") ?? undefined;
    const clientSessionId = normalizeClientSessionId(
      requestData?.clientSessionId
    );
    const proxyBaseUrl = convexSiteUrl ?? convexUrl!;
    const proxyResponse = await fetch(`${proxyBaseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify({
        messages: Array.isArray(requestData?.messages) ? requestData.messages : [],
        threadId: requestData?.threadId ?? undefined,
        clientSessionId,
      }),
    });

    const contentType = proxyResponse.headers.get("content-type") ?? "";
    const isUiStream =
      proxyResponse.headers.has("x-vercel-ai-ui-message-stream") ||
      proxyResponse.headers.has("x-vercel-ai-data-stream") ||
      contentType.includes("text/event-stream") ||
      contentType.includes("text/plain");

    if (proxyResponse.ok && isUiStream && proxyResponse.body) {
      const headers = new Headers(proxyResponse.headers);
      headers.set("Cache-Control", "no-store");
      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        headers,
      });
    }

    const proxyText = await proxyResponse.text();
    let result: any = null;
    if (proxyText.trim()) {
      try {
        result = JSON.parse(proxyText);
      } catch {
        result = null;
      }
    }

    if (!proxyResponse.ok) {
      const isRateLimit = proxyResponse.status === 429;
      const proxyMessage =
        typeof result?.message === "string" && result.message.length > 0
          ? result.message
          : proxyText.trim();
      const errorResponse: ChatErrorResponse = {
        error: isRateLimit ? "Rate limited" : chatApiErrors.internalServerError,
        message:
          proxyMessage ||
          `Chat request failed with status ${proxyResponse.status}`,
        timestamp: new Date().toISOString(),
      };
      return new Response(JSON.stringify(errorResponse), {
        status: proxyResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      !result ||
      typeof result !== "object" ||
      typeof result.threadId !== "string" ||
      !result.assistant ||
      !Array.isArray(result.assistant.parts)
    ) {
      throw new Error("Chat service returned an invalid response payload");
    }

    const messageId = `assistant-${Date.now()}`;
    const chunks = buildAssistantChunks(
      messageId,
      result.assistant.parts,
      result.threadId
    );

    const stream = createUIMessageStream<CustomUIMessage>({
      originalMessages: requestData.messages ?? [],
      execute: ({ writer }) => {
        for (const chunk of chunks) {
          writer.write(chunk as any);
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isRateLimit = isRateLimitError(message);

    const errorResponse: ChatErrorResponse = {
      error: isRateLimit ? "Rate limited" : chatApiErrors.internalServerError,
      message: message || chatApiErrors.processingError,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: isRateLimit ? 429 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
