import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchLexicon } from "@/lib/tools/lexicon";

/**
 * MCP (Model Context Protocol) Handler
 *
 * This handler provides access to the lexicon search functionality via MCP.
 * It enables AI models to search and retrieve lexical entries from the database.
 *
 * The handler exposes a single tool:
 * - search_lexicon: Search for lexical entries using search terms
 *
 * Configuration:
 * - No authentication required (basic setup)
 * - Uses SSE (Server-Sent Events) transport for real-time communication
 * - Connects to the existing lexicon search functionality
 *
 * Usage:
 * - Connect via mcp-remote: npx mcp-remote http://localhost:3000/mcp
 * - Or direct SSE connection: http://localhost:3000/mcp (if client supports)
 */
const handler = createMcpHandler(
  (server) => {
    // Register the lexicon search tool
    server.tool(
      "search_lexicon",
      "Search for lexical entries in the database. Searches through titles and content of lexical entries to find relevant matches.",
      {
        terms: z
          .array(z.string())
          .min(1)
          .max(6)
          .describe(
            "Array of search terms to look for in lexical entries. Maximum 6 terms."
          )
      },
      async ({ terms }) => {
        try {
          // Call the existing lexicon search function
          const result = await searchLexicon(terms);

          // Return results in MCP format
          if (result.error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error searching lexicon: ${result.error}\n\nNext steps: ${result.nextSteps}`
                }
              ]
            };
          }

          // Format successful results
          const resultText =
            result.entries.length > 0
              ? `Found ${result.entries.length} lexical entries:\n\n${result.formattedText}\n\n${result.nextSteps}`
              : `No lexical entries found for terms: ${terms.join(", ")}\n\n${result.nextSteps}`;

          return {
            content: [
              {
                type: "text",
                text: resultText
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error occurred while searching lexicon: ${error instanceof Error ? error.message : "Unknown error"}`
              }
            ]
          };
        }
      }
    );
  },
  {
    // Server configuration options
  },
  {
    // Transport configuration
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development"
  }
);

export { handler as GET, handler as POST };
