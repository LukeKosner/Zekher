import { describe, expect, it } from "bun:test";

import {
  CHAT_RATE_REFRESH_EVENT,
  CHAT_SESSION_STORAGE_KEY,
  CHAT_THREAD_STORAGE_KEY,
  CHAT_THREAD_UPDATED_EVENT,
  MAIN_CHAT_SUGGESTIONS,
} from "../app/chat/constants";
import {
  errorMessages,
  mcpConstants,
  mcpUsageInstructions,
  nextStepsInstructions,
} from "../app/handler/[mcp]/config";
import {
  ANIMATION_CONFIG,
  CONTACT,
  EXTERNAL_LINKS,
  MCP_CAPABILITIES,
  MCP_SERVER_CONFIG,
  PAGE_STYLING,
  sectionVariants,
} from "../app/mcp/config";
import { sourcesPageConstants } from "../app/sources/config";

describe("chat constants", () => {
  it("exports storage keys, events, and suggestions", () => {
    expect(CHAT_SESSION_STORAGE_KEY).toBe("zekher_chat_session_id");
    expect(CHAT_THREAD_STORAGE_KEY).toBe("zekher_chat_thread_id");
    expect(CHAT_THREAD_UPDATED_EVENT).toBe("zekher_chat_thread_updated");
    expect(CHAT_RATE_REFRESH_EVENT).toBe("zekher_chat_rate_refresh");
    expect(MAIN_CHAT_SUGGESTIONS.length).toBeGreaterThan(5);
    expect(MAIN_CHAT_SUGGESTIONS[0]).toContain("Holocaust");
  });
});

describe("mcp route config", () => {
  it("exports usage instructions and tool metadata", () => {
    expect(mcpUsageInstructions.disclaimer).toContain("cannot guarantee");
    expect(mcpUsageInstructions.citationGuidelines).toContain(
      "EXACT citations"
    );
    expect(mcpConstants.maxTerms).toBe(6);
    expect(mcpConstants.toolName).toBe("yad_vashem_holocaust_lexicon");
    expect(mcpConstants.detailToolName).toBe("yad_vashem_lexicon_entry_detail");
    expect(mcpConstants.pdfBytesToolName).toBe(
      "yad_vashem_lexicon_read_pdf_bytes"
    );
    expect(mcpConstants.appResourceUri).toBe("ui://zekher/lexicon-explorer.html");
  });

  it("exports route-level error and next-step messages", () => {
    expect(errorMessages.noTerms).toBe("No search terms provided");
    expect(errorMessages.noResults).toBe("No results found");
    expect(errorMessages.systemError).toContain("searching the lexicon");

    expect(nextStepsInstructions.noResults).toBe("Try different search terms.");
    expect(nextStepsInstructions.noResultsLexicon).toContain("historical");
    expect(nextStepsInstructions.noSearchTerms).toContain("search terms");
    expect(nextStepsInstructions.lexicon).toContain("exact citations");
  });
});

describe("mcp page config", () => {
  it("exports animation and endpoint settings", () => {
    expect(ANIMATION_CONFIG.duration).toBe(0.8);
    expect(ANIMATION_CONFIG.delays.section5).toBe(1.0);
    expect(EXTERNAL_LINKS.chatgpt).toBe("https://chatgpt.com");
    expect(MCP_SERVER_CONFIG.protocol).toBe("Streamable HTTP");
    expect(MCP_SERVER_CONFIG.endpoints.primary).toBe("/mcp");
    expect(CONTACT.email).toBe("support@zekher.com");
  });

  it("exports MCP capabilities and styling primitives", () => {
    expect(MCP_CAPABILITIES.tools.maxResults).toBe(6);
    expect(MCP_CAPABILITIES.tools.maxTerms).toBe(6);
    expect(MCP_CAPABILITIES.appTools.detailName).toBe(
      "yad_vashem_lexicon_entry_detail"
    );
    expect(MCP_CAPABILITIES.appResource.uri).toBe(
      "ui://zekher/lexicon-explorer.html"
    );
    expect(MCP_CAPABILITIES.prompts.name).toBe("holocaust_education_context");

    expect(PAGE_STYLING.container).toContain("max-w-4xl");
    expect(PAGE_STYLING.codeBlockClasses).toContain("font-mono");
    expect(PAGE_STYLING.inlineCodeClasses).toContain("rounded");

    expect(sectionVariants.hidden.opacity).toBe(0);
    expect(sectionVariants.visible.transition.duration).toBe(
      ANIMATION_CONFIG.duration
    );
  });
});

describe("sources page constants", () => {
  it("exports copy, pagination, and metadata defaults", () => {
    expect(sourcesPageConstants.pageContent.title).toBe("Source Library");
    expect(sourcesPageConstants.tabs.lexicon).toBe("Lexicon");
    expect(sourcesPageConstants.sections.featuredLexicon).toContain("Lexicon");
    expect(sourcesPageConstants.pagination.defaultLimit).toBe(10);
    expect(sourcesPageConstants.pagination.maxLimit).toBe(50);
    expect(sourcesPageConstants.cardText.lexicon.textPreview).toBe(
      "Text Preview"
    );
    expect(sourcesPageConstants.metadata.testimony.notFoundTitle).toBe(
      "Testimony Not Found"
    );
  });
});
