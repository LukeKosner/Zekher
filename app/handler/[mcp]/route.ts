import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchLexicon } from "./utils";
import { mcpUsageInstructions, mcpConstants } from "./config";
import type { McpLexiconResponse } from "./types";

/**
 * MCP (Model Context Protocol) handler for exposing Holocaust Lexicon search to external AI agents.
 * Provides structured access to Yad Vashem's Holocaust Lexicon with proper citations and usage guidelines.
 */
const handler = createMcpHandler(
  async (server) => {
    server.tool(
      mcpConstants.toolName,
      mcpConstants.toolDescription,
      {
        terms: z
          .array(z.string())
          .max(mcpConstants.maxTerms)
          .describe(mcpConstants.parameterDescription),
        confirmInstructionsRead: z
          .boolean()
          .optional()
          .describe("Set to true to confirm you have read the holocaust_education_context prompt and will follow citation guidelines")
      },
      async ({ terms, confirmInstructionsRead }, extra) => {
        try {
          // Check if instructions were confirmed as read
          if (confirmInstructionsRead !== true) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      error: "Instructions not confirmed",
                      message: "Please read the instructions below and set confirmInstructionsRead to true to confirm you understand the citation guidelines.",
                      instructions: mcpConstants.promptText,
                      usageInstructions: mcpUsageInstructions,
                      nextSteps: "Read the instructions above, then call this tool again with confirmInstructionsRead: true"
                    },
                    null,
                    2
                  )
                }
              ]
            };
          }

          const result = await searchLexicon(terms, {
            clientSessionId: extra?.sessionId,
          });

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
  },
  {
    capabilities: {
      tools: {
        [mcpConstants.toolName]: {
          description: mcpConstants.toolDescription
        }
      },
      prompts: {
        [mcpConstants.promptName]: {
          description: mcpConstants.promptDescription
        }
      }
    }
  },
  {
    basePath: "/handler/",
    verboseLogs: false,
    maxDuration: 300
  }
);

export { handler as GET, handler as POST };
