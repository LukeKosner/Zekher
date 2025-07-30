import type { Variants } from "motion/react";

export interface DevelopersLayoutProps {
  children: React.ReactNode;
}

export interface MCPServerConfig {
  protocol: string;
  endpoints: {
    primary: string;
    fallback: string;
  };
}

export interface MCPCapability {
  name: string;
  description: string;
}

export interface MCPTool extends MCPCapability {
  maxResults?: number;
  maxTerms?: number;
}

export interface MCPPrompt extends MCPCapability {
  type: string;
}

import { AnimationConfig, ExternalLinks } from "../config";

export interface ContactInfo {
  email: string;
}

export interface PageStyling {
  container: string;
  spacing: string;
  sectionSpacing: string;
  headingClasses: string;
  paragraphClasses: string;
  linkClasses: string;
  codeBlockClasses: string;
  inlineCodeClasses: string;
  listClasses: string;
  borderClasses: string;
}

export type SectionVariants = Variants;
