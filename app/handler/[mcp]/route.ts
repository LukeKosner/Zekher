import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchLexicon } from "./utils";
import { mcpUsageInstructions, mcpConstants } from "./constants";
import type { McpLexiconResponse } from "./types";

/**
 * MCP (Model Context Protocol) handler for exposing Holocaust Lexicon search to external AI agents.
 * Provides structured access to Yad Vashem's Holocaust Lexicon with proper citations and usage guidelines.
 */
const handler = createMcpHandler(
  async (server) => {
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
                text: mcpConstants.promptText
              }
            }
          ]
        };
      }
    );

    server.tool(
      mcpConstants.toolName,
      mcpConstants.toolDescription,
      {
        terms: z
          .array(z.string())
          .max(mcpConstants.maxTerms)
          .describe(mcpConstants.parameterDescription)
      },
      async ({ terms }) => {
        try {
          const result = await searchLexicon(terms);

          const response: McpLexiconResponse = {
            sources: result.entries,
            usageInstructions: mcpUsageInstructions,
            nextSteps: result.nextSteps
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
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
                    usageInstructions: mcpUsageInstructions
                  },
                  null,
                  2
                )
              }
            ]
          };
        }
      }
    );
  },
  {
    capabilities: {
      prompts: {
        [mcpConstants.promptName]: {
          description: mcpConstants.promptDescription
        }
      },
      tools: {
        [mcpConstants.toolName]: {
          description: mcpConstants.toolDescription
        }
      }
    }
  },
  {
    basePath: "/handler/",
    verboseLogs: false,
    maxDuration: 300,
    redisUrl: process.env.REDIS_URL
  }
);

export { handler as GET, handler as POST };
