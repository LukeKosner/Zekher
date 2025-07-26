/**
 * Root Layout Component
 *
 * Optimized layout structure with server components by default and client components
 * only where needed for interactivity. Provides global styles, fonts, analytics,
 * authentication, and metadata configuration.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientSidebarLayout } from "@/components/layout/ClientSidebarLayout";
import { Analytics } from "@vercel/analytics/next";
import { 
  SITE_METADATA, 
  FONT_CONFIG, 
  ICON_CONFIG, 
  LAYOUT_CONFIG, 
  PAGE_STYLING, 
  ERROR_MESSAGES 
} from "./constants";
import type { LayoutProps } from "./types";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

/**
 * Inter font configuration for consistent typography
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

/**
 * Application metadata configuration for SEO and social media optimization
 */
export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  keywords: SITE_METADATA.keywords,
  openGraph: {
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    url: SITE_METADATA.siteUrl,
    siteName: SITE_METADATA.siteName,
    type: "website",
    images: [ICON_CONFIG.openGraphImage]
  },
  icons: {
    icon: [ICON_CONFIG.favicon32, ICON_CONFIG.favicon16],
    apple: ICON_CONFIG.appleTouchIcon
  },
  manifest: LAYOUT_CONFIG.manifest
};

/**
 * Root Layout Component
 *
 * Server component that handles static HTML structure and provides:
 * - Authentication context via ClerkProvider
 * - Analytics tracking
 * - Performance optimizations (DNS prefetch, font loading)
 * - Global styles and theme configuration
 * - Client component boundary for interactive elements
 *
 * @param children - React node children to render in the layout
 * @returns JSX element representing the root HTML structure
 */
export default function RootLayout({ children }: Readonly<LayoutProps>) {
  // Input validation
  if (!children) {
    logger.warn(ERROR_MESSAGES.noChildren);
  }

  // Validate layout constants are properly loaded
  if (!SITE_METADATA.siteName || !SITE_METADATA.description) {
    logger.error(ERROR_MESSAGES.layoutConstantsNotConfigured, {
      siteName: SITE_METADATA.siteName,
      description: SITE_METADATA.description
    });
    Sentry.captureMessage(ERROR_MESSAGES.layoutConstantsMissing, {
      level: "error",
      tags: { component: "layout" }
    });
  }

  return (
    <html lang="en">
      <Analytics />
      <head>
        {/* Static performance optimizations */}
        <link
          rel="dns-prefetch"
          href={LAYOUT_CONFIG.dnsPreFetch.googleFonts}
        />
        <link
          rel="dns-prefetch"
          href={LAYOUT_CONFIG.dnsPreFetch.googleFontsStatic}
        />
        <meta name="theme-color" content={SITE_METADATA.themeColor} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Client Component boundary - only interactive parts */}
        <ClientSidebarLayout>
          {children || (
            <div className={PAGE_STYLING.loadingFallback.container}>
              <p>{PAGE_STYLING.loadingFallback.text}</p>
            </div>
          )}
        </ClientSidebarLayout>
      </body>
    </html>
  );
}
