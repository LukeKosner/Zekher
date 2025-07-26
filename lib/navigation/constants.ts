/**
 * Navigation and routing constants
 */

/** Navigation sections */
export const NAVIGATION_SECTIONS = {
  PROJECT: "Project",
  EVERYONE: "Everyone", 
  DEVELOPERS: "Developers",
  UNKNOWN: "Unknown",
} as const;

/** Route paths and redirects */
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CHAT: "/chat", 
  SOURCES: "/sources",
  DEVELOPERS_MCP: "/developers/mcp",
  DEVELOPERS: "/developers", // Redirects to MCP
} as const;