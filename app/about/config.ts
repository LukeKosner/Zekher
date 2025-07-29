import type { SectionVariant } from "./types";

export const ANIMATION_CONFIG = {
  duration: 0.8,
  ease: "easeOut" as const,
  delays: {
    section1: 0.2,
    section2: 0.4,
    section3: 0.6
  },
  transition: {
    opacity: { from: 0, to: 1 },
    y: { from: 30, to: 0 }
  }
} as const;

export const EXTERNAL_LINKS = {
  grokHolocaustDenial:
    "https://www.theguardian.com/technology/2025/may/18/musks-ai-bot-grok-blames-its-holocaust-scepticism-on-programming-error",
  unescoReport:
    "https://www.unesco.org/en/articles/unesco-and-world-jewish-congress-report-shows-holocaust-denial-and-distortion-proliferating-social",
  yadVashemLexicon:
    "https://www.yadvashem.org/holocaust/resource-center/lexicon.html",
  boderInterviews: "https://voices.library.iit.edu/",
  claude: "https://claude.ai",
  chatgpt: "https://chatgpt.com"
} as const;

export const INTERNAL_LINKS = {
  chat: "/chat",
  mcpDocs: "/mcp",
  sources: "/sources"
} as const;

export const CONTENT_SECTIONS = {
  mission: {
    title: "Mission",
    hebrewTranslation: "(זכר, remembrance in Hebrew)"
  },
  problem: {
    title: "Problem"
  },
  resources: {
    title: "Resources"
  }
} as const;

export const PAGE_STYLING = {
  container: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16",
  spacing: "space-y-12",
  sectionSpacing: "space-y-8",
  headingClasses: "text-2xl font-semibold",
  paragraphClasses: "mt-4 text-lg",
  linkClasses: "underline",
  iconClasses: "inline w-4 h-4",
  iconWithMargin: "inline w-4 h-4 ml-1"
} as const;

export const sectionVariant: SectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration,
      ease: "easeOut"
    }
  }
};
