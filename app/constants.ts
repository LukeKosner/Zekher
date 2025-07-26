/**
 * App root constants
 * Centralized configuration for the main application layout and homepage
 */

// =============================================================================
// SITE METADATA AND CONFIGURATION
// =============================================================================

export const SITE_METADATA = {
  title: "Zekher",
  siteName: "Zekher זכר",
  description: "Access authoritative Holocaust education materials through AI-powered search of Yad Vashem resources and survivor testimonies. Built to preserve memory and combat denial.",
  siteUrl: "https://zekher.com",
  themeColor: "#1f2937",
  keywords: [
    "Holocaust education", 
    "Yad Vashem", 
    "survivor testimonies", 
    "David Boder", 
    "Holocaust history", 
    "AI education"
  ] as string[] // Mutable for Next.js metadata
} as const;

// =============================================================================
// FONT CONFIGURATION
// =============================================================================

export const FONT_CONFIG = {
  variable: "--font-inter",
  subsets: ["latin"] as const
} as const;

// =============================================================================
// ICON AND MANIFEST CONFIGURATION
// =============================================================================

export const ICON_CONFIG = {
  favicon32: { 
    url: "/favicon-32x32.png", 
    sizes: "32x32", 
    type: "image/png" 
  },
  favicon16: { 
    url: "/favicon-16x16.png", 
    sizes: "16x16", 
    type: "image/png" 
  },
  appleTouchIcon: { 
    url: "/apple-touch-icon.png", 
    sizes: "192x192", 
    type: "image/png" 
  },
  openGraphImage: {
    url: "/opengraph-image.png",
    width: 512,
    height: 512,
    alt: "Zekher - Holocaust Education"
  }
} as const;

export const LAYOUT_CONFIG = {
  manifest: "/site.webmanifest",
  dnsPreFetch: {
    googleFonts: "//fonts.googleapis.com",
    googleFontsStatic: "//fonts.gstatic.com"
  }
} as const;

// =============================================================================
// HOMEPAGE CONTENT AND MESSAGING
// =============================================================================

export const HOMEPAGE_CONTENT = {
  announcement: {
    tag: "v3 Beta",
    title: "Support for MCP",
    link: "/developers/mcp"
  },
  hero: {
    mainHeading: "Preserving Holocaust memory with AI",
    subheading: "Access authoritative Holocaust education materials through AI-powered search of",
    ctaButtons: {
      primary: {
        text: "Start Chat",
        href: "/chat"
      },
      secondary: {
        text: "Browse Sources", 
        href: "/sources"
      }
    }
  },
  solutionOverview: {
    heading: "Tools for Responsible Agents",
    subheading: "By integrating authoritative sources directly into AI systems, we ensure accurate, verified information reaches users when they need it most.",
    features: [
      {
        title: "Chat Experience",
        description: "Familiar AI chat powered by Lexicon content with real interview audio snippets as supplements.",
        cta: {
          text: "Try Chat",
          href: "/chat"
        }
      },
      {
        title: "MCP Server", 
        description: "Model Context Protocol server for adding Lexicon functionality to Claude, ChatGPT, and other AI clients.",
        cta: {
          text: "Learn More",
          href: "/developers/mcp"
        }
      },
      {
        title: "Source Library",
        description: "Unified library serving as the landing page for citations from both Chat and MCP integrations.",
        cta: {
          text: "Browse Sources",
          href: "/sources"
        }
      }
    ]
  },
  getInvolved: {
    heading: "Get Involved",
    subheading: "Zekher is an open-source project in beta. If you have any questions, feedback, or want to contribute, please reach out.",
    ctaButtons: {
      email: {
        text: "Email Us",
        href: "mailto:hey@lukekosner.com"
      },
      about: {
        text: "About",
        href: "/about"
      }
    }
  }
} as const;

// =============================================================================
// EXTERNAL LINKS
// =============================================================================

export const EXTERNAL_LINKS = {
  yadVashem: {
    url: "https://www.yadvashem.org/holocaust/resource-center/lexicon.html",
    text: "Yad Vashem resources"
  },
  survivorTestimonies: {
    url: "https://voices.library.iit.edu/",
    text: "survivor testimonies"
  },
  unsplashCredit: {
    photographer: {
      name: "Giulia Gasperini",
      url: "https://unsplash.com/@giuliagasp?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
    },
    platform: {
      name: "Unsplash",
      url: "https://unsplash.com/photos/cemetery-vault-8S-D-UodlHU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
    }
  }
} as const;

// =============================================================================
// ANIMATION CONFIGURATION
// =============================================================================

export const ANIMATION_CONFIG = {
  hero: {
    announcement: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    heading: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
    },
    subheading: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, delay: 0.4, ease: "easeOut" }
    },
    buttons: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, delay: 0.6, ease: "easeOut" }
    }
  },
  memorialImage: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.8, ease: "easeOut" }
  },
  solutionOverview: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 1.2, ease: "easeOut" }
  },
  featureCards: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 1.4, ease: "easeOut" }
  },
  finalCta: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 1.6, ease: "easeOut" }
  }
} as const;

// =============================================================================
// IMAGE CONFIGURATION
// =============================================================================

export const IMAGE_CONFIG = {
  memorial: {
    src: "/giulia-gasperini-8S-D-UodlHU-unsplash.jpg",
    alt: "Memorial to the Murdered Jews of Europe",
    aspectRatio: 2217 / 1478
  }
} as const;

// =============================================================================
// LAYOUT AND STYLING
// =============================================================================

export const PAGE_STYLING = {
  maxWidth: "max-w-4xl",
  padding: "px-4 sm:px-6 lg:px-8 py-24",
  gap: "gap-20",
  heroFontSizes: "text-6xl md:text-7xl xl:text-[5.25rem]",
  sectionSpacing: "space-y-8",
  gridCols: "grid-cols-1 md:grid-cols-3",
  loadingFallback: {
    container: "flex items-center justify-center min-h-screen",
    text: "Loading..."
  }
} as const;

// =============================================================================
// ERROR HANDLING
// =============================================================================

export const ERROR_MESSAGES = {
  noChildren: "RootLayout: No children provided",
  layoutConstantsNotConfigured: "RootLayout: Layout constants not properly configured",
  layoutConstantsMissing: "Layout constants not properly configured"
} as const;

// =============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// =============================================================================

export const layoutConstants = {
  siteName: SITE_METADATA.siteName,
  description: SITE_METADATA.description,
  siteUrl: SITE_METADATA.siteUrl,
  themeColor: SITE_METADATA.themeColor,
  icons: ICON_CONFIG,
  manifest: LAYOUT_CONFIG.manifest,
  dnsPreFetch: LAYOUT_CONFIG.dnsPreFetch
} as const;