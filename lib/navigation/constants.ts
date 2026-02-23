/** Navigation sections */
export const NAVIGATION_SECTIONS = {
  PROJECT: "Project",
  EVERYONE: "Everyone",
  EDUCATION: "Education",
  DEVELOPERS: "Developers",
  UNKNOWN: "Unknown"
} as const;

/** Route paths and redirects */
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CHAT: "/chat",
  SOURCES: "/sources",
  CLASSROOM: "/classroom",
  CLASSROOM_STUDENT: "/classroom/join",
  CLASSROOM_TEACHER: "/classroom/teacher",
  DEVELOPERS_MCP: "/mcp",
  DEVELOPERS: "/developers" // Redirects to MCP
} as const;
