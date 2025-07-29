/**
 * Root Layout Component
 *
 * Optimized layout structure with server components by default and client components
 * only where needed for interactivity. Provides global styles, fonts, analytics,
 * authentication, and metadata configuration.
 */

import { layoutConstants } from "@/components/layout/config";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientSidebarLayout } from "@/components/layout/ClientSidebarLayout";
import { Analytics } from "@vercel/analytics/next";

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
 * Generate metadata with Sentry trace data for distributed tracing
 */
export function generateMetadata(): Metadata {
  return {
    ...staticMetadata,
    other: {
      ...Sentry.getTraceData()
    }
  };
}

/**
 * Static metadata configuration for SEO and social media optimization
 */
const staticMetadata: Metadata = {
  metadataBase: new URL(layoutConstants.siteUrl),
  title: layoutConstants.siteName,
  description: layoutConstants.description,
  keywords: [
    "Holocaust education",
    "Yad Vashem",
    "survivor testimonies",
    "David Boder",
    "Holocaust history",
    "AI education"
  ],
  openGraph: {
    title: layoutConstants.siteName,
    description: layoutConstants.description,
    url: layoutConstants.siteUrl,
    siteName: layoutConstants.siteName,
    type: "website",
    images: [
      {
        url: layoutConstants.icons.openGraphImage.url,
        width: layoutConstants.icons.openGraphImage.width,
        height: layoutConstants.icons.openGraphImage.height,
        alt: layoutConstants.icons.openGraphImage.alt
      }
    ]
  },
  icons: {
    icon: [
      {
        url: layoutConstants.icons.favicon32.url,
        sizes: layoutConstants.icons.favicon32.sizes,
        type: layoutConstants.icons.favicon32.type
      },
      {
        url: layoutConstants.icons.favicon16.url,
        sizes: layoutConstants.icons.favicon16.sizes,
        type: layoutConstants.icons.favicon16.type
      }
    ],
    apple: {
      url: layoutConstants.icons.appleTouchIcon.url,
      sizes: layoutConstants.icons.appleTouchIcon.sizes,
      type: layoutConstants.icons.appleTouchIcon.type
    }
  },
  manifest: layoutConstants.manifest
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
    logger.warn("RootLayout: No children provided");
  }

  // Validate layout constants are properly loaded
  const { siteName, description } = layoutConstants;

  if (!siteName || !description) {
    logger.error("RootLayout: Layout constants not properly configured", {
      siteName,
      description
    });
    Sentry.captureMessage("Layout constants not properly configured", {
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
          href={layoutConstants.dnsPreFetch.googleFonts}
        />
        <link
          rel="dns-prefetch"
          href={layoutConstants.dnsPreFetch.googleFontsStatic}
        />
        <meta name="theme-color" content={layoutConstants.themeColor} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Client Component boundary - only interactive parts */}
        <ClientSidebarLayout>
          {children || (
            <div className="flex items-center justify-center min-h-screen">
              <p>Loading...</p>
            </div>
          )}
        </ClientSidebarLayout>
      </body>
    </html>
  );
}
