/**
 * App root type definitions
 * Type definitions for the main application layout and homepage components
 */

import type { ReactNode } from "react";

// =============================================================================
// LAYOUT COMPONENT TYPES
// =============================================================================

/**
 * Props for the root layout component
 */
export interface LayoutProps {
  children: ReactNode;
}

/**
 * Font configuration interface
 */
export interface FontConfig {
  variable: string;
  subsets: readonly string[];
}

/**
 * Icon configuration interface
 */
export interface IconConfig {
  url: string;
  sizes: string;
  type: string;
}

/**
 * Open Graph image configuration interface
 */
export interface OpenGraphImageConfig {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Complete icon set configuration
 */
export interface IconSetConfig {
  favicon32: IconConfig;
  favicon16: IconConfig;
  appleTouchIcon: IconConfig;
  openGraphImage: OpenGraphImageConfig;
}

/**
 * DNS prefetch configuration
 */
export interface DnsPreFetchConfig {
  googleFonts: string;
  googleFontsStatic: string;
}

/**
 * Layout configuration interface
 */
export interface LayoutConfig {
  manifest: string;
  dnsPreFetch: DnsPreFetchConfig;
}

// =============================================================================
// HOMEPAGE CONTENT TYPES
// =============================================================================

/**
 * CTA button configuration
 */
export interface CtaButton {
  text: string;
  href: string;
}

/**
 * Feature card configuration for homepage
 */
export interface FeatureCard {
  title: string;
  description: string;
  cta: CtaButton;
}

/**
 * Hero section configuration
 */
export interface HeroSection {
  mainHeading: string;
  subheading: string;
  ctaButtons: {
    primary: CtaButton;
    secondary: CtaButton;
  };
}

/**
 * Solution overview section configuration
 */
export interface SolutionOverviewSection {
  heading: string;
  subheading: string;
  features: readonly FeatureCard[];
}

/**
 * Get involved section configuration
 */
export interface GetInvolvedSection {
  heading: string;
  subheading: string;
  ctaButtons: {
    email: CtaButton;
    about: CtaButton;
  };
}

/**
 * Announcement banner configuration
 */
export interface AnnouncementConfig {
  tag: string;
  title: string;
  link: string;
}

/**
 * Complete homepage content configuration
 */
export interface HomepageContent {
  announcement: AnnouncementConfig;
  hero: HeroSection;
  solutionOverview: SolutionOverviewSection;
  getInvolved: GetInvolvedSection;
}

// =============================================================================
// EXTERNAL LINKS TYPES
// =============================================================================

/**
 * External link configuration
 */
export interface ExternalLink {
  url: string;
  text: string;
}

/**
 * Unsplash credit configuration
 */
export interface UnsplashCredit {
  photographer: {
    name: string;
    url: string;
  };
  platform: {
    name: string;
    url: string;
  };
}

/**
 * External links configuration
 */
export interface ExternalLinks {
  yadVashem: ExternalLink;
  survivorTestimonies: ExternalLink;
  unsplashCredit: UnsplashCredit;
}

// =============================================================================
// ANIMATION TYPES
// =============================================================================

/**
 * Motion animation configuration
 */
export interface MotionConfig {
  initial: {
    opacity: number;
    y: number;
  };
  animate: {
    opacity: number;
    y: number;
  };
  transition: {
    duration: number;
    delay?: number;
    ease: string;
  };
}

/**
 * Hero section animation configuration
 */
export interface HeroAnimationConfig {
  announcement: MotionConfig;
  heading: MotionConfig;
  subheading: MotionConfig;
  buttons: MotionConfig;
}

/**
 * Complete animation configuration
 */
export interface AnimationConfig {
  hero: HeroAnimationConfig;
  memorialImage: MotionConfig;
  solutionOverview: MotionConfig;
  featureCards: MotionConfig;
  finalCta: MotionConfig;
}

// =============================================================================
// IMAGE CONFIGURATION TYPES
// =============================================================================

/**
 * Image configuration interface
 */
export interface ImageConfig {
  src: string;
  alt: string;
  aspectRatio: number;
}

/**
 * All image configurations
 */
export interface ImageConfigurations {
  memorial: ImageConfig;
}

// =============================================================================
// STYLING AND LAYOUT TYPES
// =============================================================================

/**
 * Loading fallback configuration
 */
export interface LoadingFallbackConfig {
  container: string;
  text: string;
}

/**
 * Page styling configuration
 */
export interface PageStylingConfig {
  maxWidth: string;
  padding: string;
  gap: string;
  heroFontSizes: string;
  sectionSpacing: string;
  gridCols: string;
  loadingFallback: LoadingFallbackConfig;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

/**
 * Error messages configuration
 */
export interface ErrorMessages {
  noChildren: string;
  layoutConstantsNotConfigured: string;
  layoutConstantsMissing: string;
}

/**
 * Global error component props
 */
export interface GlobalErrorProps {
  error: Error & { digest?: string };
}

// =============================================================================
// SITE METADATA TYPES
// =============================================================================

/**
 * Site metadata configuration
 */
export interface SiteMetadata {
  title: string;
  siteName: string;
  description: string;
  siteUrl: string;
  themeColor: string;
  keywords: string[];
}

// =============================================================================
// LEGACY COMPATIBILITY TYPES
// =============================================================================

/**
 * Legacy layout constants interface for backward compatibility
 * @deprecated Use individual config objects instead
 */
export interface LegacyLayoutConstants {
  siteName: string;
  description: string;
  siteUrl: string;
  themeColor: string;
  icons: IconSetConfig;
  manifest: string;
  dnsPreFetch: DnsPreFetchConfig;
}