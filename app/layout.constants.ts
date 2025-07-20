/**
 * Layout constants co-located with app/layout.tsx
 * Following Next.js convention for page/layout-specific configuration
 */

export const siteMetadata = {
  siteName: "Zekher - Holocaust Education",
  description: "Access authoritative Holocaust education materials through AI-powered search of Yad Vashem resources and survivor testimonies",
  siteUrl: "https://zekher.com",
  themeColor: "#1f2937"
} as const;

export const fontConfig = {
  variable: "--font-inter",
  subsets: ["latin"] as const
} as const;

export const iconConfig = {
  favicon32: { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
  favicon16: { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  appleTouchIcon: { url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
  openGraphImage: {
    url: "/opengraph-image.png",
    width: 512,
    height: 512,
    alt: "Zekher - Holocaust Education"
  }
} as const;

export const layoutConfig = {
  manifest: "/site.webmanifest",
  dnsPreFetch: {
    googleFonts: "//fonts.googleapis.com",
    googleFontsStatic: "//fonts.gstatic.com"
  }
} as const;