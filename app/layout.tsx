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
import { ClerkProvider } from "@clerk/nextjs";
import { siteMetadata, fontConfig, iconConfig, layoutConfig } from "./layout.constants";
import type { LayoutProps } from "./types";

/**
 * Inter font configuration for consistent typography
 */
const inter = Inter({
  variable: fontConfig.variable,
  subsets: fontConfig.subsets
});

/**
 * Application metadata configuration for SEO and social media optimization
 */
export const metadata: Metadata = {
  title: siteMetadata.siteName,
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.siteName, 
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: "Zekher",
    type: "website",
    images: [iconConfig.openGraphImage]
  },
  icons: {
    icon: [
      iconConfig.favicon32,
      iconConfig.favicon16
    ],
    apple: iconConfig.appleTouchIcon
  },
  manifest: layoutConfig.manifest
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
    console.warn('RootLayout: No children provided');
  }
  
  // Validate layout constants are properly loaded
  if (!siteMetadata.siteName || !siteMetadata.description) {
    console.error('RootLayout: Layout constants not properly configured');
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <Analytics />
          <head>
            {/* Static performance optimizations */}
            <link rel="dns-prefetch" href={layoutConfig.dnsPreFetch.googleFonts} />
            <link rel="dns-prefetch" href={layoutConfig.dnsPreFetch.googleFontsStatic} />
            <meta name="theme-color" content={siteMetadata.themeColor} />
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
    </ClerkProvider>
  );
}
