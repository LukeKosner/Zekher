import { createMcpHandler } from "mcp-handler";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { getLexiconExplorerAppHtml } from "./app-view";
import { searchLexicon, getLexiconEntryDetail } from "./utils";
import { mcpUsageInstructions, mcpConstants } from "./config";
import type {
  McpLexiconAppSource,
  McpLexiconDetailStructuredContent,
  McpLexiconResponse,
  McpLexiconSearchStructuredContent,
} from "./types";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://zekher.com";
}

type RequestHeaders = Record<string, string | string[] | undefined>;

function getHeaderValue(headers: RequestHeaders | undefined, name: string) {
  if (!headers) return undefined;
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (typeof direct === "string") return direct;
  if (Array.isArray(direct)) return direct[0];
  return undefined;
}

function extractClientIp(headers: RequestHeaders | undefined): string | undefined {
  const forwarded = getHeaderValue(headers, "x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = getHeaderValue(headers, "x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const cfIp = getHeaderValue(headers, "cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();

  return undefined;
}

function extractClientSessionId(
  extraSessionId: string | undefined,
  headers: RequestHeaders | undefined
): string | undefined {
  const headerSessionId = getHeaderValue(headers, "mcp-session-id");
  if (headerSessionId?.trim()) {
    return headerSessionId.trim();
  }
  return extraSessionId;
}

function toAppSource(source: {
  id: string;
  title: string;
  content: string;
  citation: string;
  filename: string;
  pdfUrl?: string | null;
  txtUrl?: string | null;
  redirectUrl?: string | null;
}): McpLexiconAppSource {
  return {
    ...source,
    citationUrl: `${getBaseUrl()}/sources/lexicon/${source.id}`,
  };
}

function getLexiconContentPreview(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  return cleaned.length > 300 ? `${cleaned.slice(0, 300)}...` : cleaned;
}

function formatSearchResponseText(
  response: McpLexiconResponse,
  queryTerms: string[]
): string {
  if (!response.sources.length) {
    return `No lexicon sources found for: ${queryTerms.join(", ")}. ${response.nextSteps}`;
  }

  const lines = response.sources.map((source, index) => {
    return [
      `${index + 1}. ${source.title}`,
      `Citation: ${source.citation}`,
      `Preview: ${getLexiconContentPreview(source.content)}`,
    ].join("\n");
  });

  return [
    `Found ${response.sources.length} lexicon source${
      response.sources.length === 1 ? "" : "s"
    } for: ${queryTerms.join(", ")}.`,
    "",
    ...lines,
    "",
    `Instructions: ${response.nextSteps}`,
  ].join("\n");
}

/**
 * MCP (Model Context Protocol) handler for exposing Holocaust Lexicon search to external AI agents.
 * Provides structured access to Yad Vashem's Holocaust Lexicon with proper citations and usage guidelines.
 */
const handler = createMcpHandler(
  async (server) => {
    registerAppResource(
      server,
      mcpConstants.appResourceName,
      mcpConstants.appResourceUri,
      {
        description: mcpConstants.appResourceDescription,
      },
      async () => ({
        contents: [
          {
            uri: mcpConstants.appResourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: getLexiconExplorerAppHtml(),
            _meta: {
              ui: {
                prefersBorder: true,
              },
            },
          },
        ],
      })
    );

    registerAppTool(
      server,
      mcpConstants.toolName,
      {
        title: "Yad Vashem Holocaust Lexicon Search",
        description: mcpConstants.toolDescription,
        inputSchema: {
          terms: z
            .array(z.string())
            .max(mcpConstants.maxTerms)
            .describe(mcpConstants.parameterDescription),
          confirmInstructionsRead: z
            .boolean()
            .optional()
            .describe(
              "Set to true to confirm you read the holocaust_education_context prompt and will follow citation guidelines"
            ),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
        },
        _meta: {
          ui: {
            resourceUri: mcpConstants.appResourceUri,
          },
          "openai/outputTemplate": mcpConstants.appResourceUri,
          "openai/widgetAccessible": true,
          "openai/visibility": "public",
        },
      },
      async ({ terms, confirmInstructionsRead }, extra) => {
        const requestHeaders = extra?.requestInfo?.headers as RequestHeaders;
        const clientSessionId = extractClientSessionId(
          extra?.sessionId,
          requestHeaders
        );

        try {
          if (confirmInstructionsRead !== true) {
            const message =
              "Please read the holocaust_education_context prompt, then call this tool again with confirmInstructionsRead: true.";
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `${message}\n\n${mcpConstants.promptText}`,
                },
              ],
              structuredContent: {
                type: "instructions_required",
                message,
                nextSteps:
                  "Read the prompt and call the tool again with confirmInstructionsRead set to true.",
              },
            };
          }

          const result = await searchLexicon(terms, {
            clientSessionId,
            ip: extractClientIp(requestHeaders),
          });
          const appSources = result.entries.map(toAppSource);

          if (result.error === "Rate limited") {
            const structuredContent: McpLexiconSearchStructuredContent = {
              type: "lexicon_search",
              queryTerms: terms,
              resultCount: 0,
              sources: [],
              nextSteps:
                "You have hit the MCP rate limit. Wait and try again in about an hour.",
            };
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: "Rate limited: too many MCP requests from this session. Please try again later.",
                },
              ],
              structuredContent,
              _meta: {
                queryTerms: terms,
                rateLimited: true,
              },
            };
          }

          const response: McpLexiconResponse = {
            sources: result.entries,
            usageInstructions: mcpUsageInstructions,
            nextSteps: result.nextSteps,
          };

          const structuredContent: McpLexiconSearchStructuredContent = {
            type: "lexicon_search",
            queryTerms: terms,
            resultCount: appSources.length,
            sources: appSources,
            nextSteps: response.nextSteps,
          };

          return {
            isError: Boolean(result.error && appSources.length === 0),
            content: [
              {
                type: "text",
                text: formatSearchResponseText(response, terms),
              },
            ],
            structuredContent,
            _meta: {
              queryTerms: terms,
              usageInstructions: response.usageInstructions,
            },
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: mcpConstants.errorSearchFailed,
                    message:
                      error instanceof Error
                        ? error.message
                        : mcpConstants.errorUnknown,
                    usageInstructions: mcpUsageInstructions,
                    nextSteps: "Retry with simpler terms.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
      }
    );

    registerAppTool(
      server,
      mcpConstants.detailToolName,
      {
        title: "Lexicon Entry Detail",
        description: mcpConstants.detailToolDescription,
        inputSchema: {
          sourceId: z.string().min(1).describe(mcpConstants.detailParameterDescription),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
        },
        _meta: {
          ui: {
            resourceUri: mcpConstants.appResourceUri,
            visibility: ["app"],
          },
          "openai/outputTemplate": mcpConstants.appResourceUri,
          "openai/widgetAccessible": true,
          "openai/visibility": "private",
        },
      },
      async ({ sourceId }) => {
        const detail = await getLexiconEntryDetail(sourceId);
        if (!detail.entry) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: detail.error ?? "Entry not found.",
              },
            ],
          };
        }

        const structuredContent: McpLexiconDetailStructuredContent = {
          type: "lexicon_entry_detail",
          entry: detail.entry,
        };

        return {
          content: [
            {
              type: "text",
              text: `Loaded "${detail.entry.title}".`,
            },
          ],
          structuredContent,
        };
      }
    );

    server.prompt(
      mcpConstants.promptName,
      mcpConstants.promptDescription,
      async () => {
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: mcpConstants.promptText,
              },
            },
          ],
        };
      }
    );
  },
  {},
  {
    basePath: "/handler/",
    verboseLogs: false,
    maxDuration: 300,
  }
);

export { handler as GET, handler as POST };
