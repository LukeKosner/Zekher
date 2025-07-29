import type { Metadata } from "next";
import type { Variants } from "framer-motion";

export interface AboutLayoutProps {
  children: React.ReactNode;
}

import { AnimationConfig, ExternalLinks } from "../config";

export interface InternalLinks {
  chat: string;
  mcpDocs: string;
  sources: string;
}

export interface ContentSection {
  title: string;
  hebrewTranslation?: string;
}

export interface ContentSections {
  mission: ContentSection;
  problem: ContentSection;
  resources: ContentSection;
}

export interface PageStyling {
  container: string;
  spacing: string;
  sectionSpacing: string;
  headingClasses: string;
  paragraphClasses: string;
  linkClasses: string;
  iconClasses: string;
  iconWithMargin: string;
}

export type SectionVariant = Variants;
