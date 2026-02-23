import {
  MessagesSquare,
  LibraryBig,
  Info,
  Home,
  Server,
  GraduationCap,
  Presentation
} from "lucide-react";
import type { NavigationItem } from "./types";
import { NAVIGATION_SECTIONS, ROUTES } from "./constants";

export const NAVIGATION_CONFIG: NavigationItem[] = [
  // Project section
  {
    href: ROUTES.HOME,
    icon: Home,
    label: "Home",
    breadcrumbLabel: "Home",
    section: NAVIGATION_SECTIONS.PROJECT
  },
  {
    href: ROUTES.ABOUT,
    icon: Info,
    label: "About",
    breadcrumbLabel: "About",
    section: NAVIGATION_SECTIONS.PROJECT
  },

  // Everyone section
  {
    href: ROUTES.CHAT,
    icon: MessagesSquare,
    label: "Chat",
    breadcrumbLabel: "Chat",
    section: NAVIGATION_SECTIONS.EVERYONE
  },
  {
    href: ROUTES.SOURCES,
    icon: LibraryBig,
    label: "Sources",
    breadcrumbLabel: "Sources",
    section: NAVIGATION_SECTIONS.EVERYONE
  },

  // Education section
  {
    href: ROUTES.CLASSROOM_STUDENT,
    icon: GraduationCap,
    label: "Student",
    breadcrumbLabel: "Student",
    section: NAVIGATION_SECTIONS.EDUCATION
  },
  {
    href: ROUTES.CLASSROOM_TEACHER,
    icon: Presentation,
    label: "Teacher",
    breadcrumbLabel: "Teacher",
    section: NAVIGATION_SECTIONS.EDUCATION
  },

  // Developers section
  {
    href: ROUTES.DEVELOPERS_MCP,
    icon: Server,
    label: "MCP",
    breadcrumbLabel: "MCP",
    section: NAVIGATION_SECTIONS.DEVELOPERS
  }
];
