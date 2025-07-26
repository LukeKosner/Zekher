import { test, describe, expect } from "bun:test";
import type {
  LayoutProps,
  FontConfig,
  IconConfig,
  OpenGraphImageConfig,
  IconSetConfig,
  DnsPreFetchConfig,
  LayoutConfig,
  CtaButton,
  FeatureCard,
  HeroSection,
  SolutionOverviewSection,
  GetInvolvedSection,
  AnnouncementConfig,
  HomepageContent,
  ExternalLink,
  UnsplashCredit,
  ExternalLinks,
  MotionConfig,
  HeroAnimationConfig,
  AnimationConfig,
  ImageConfig,
  ImageConfigurations,
  LoadingFallbackConfig,
  PageStylingConfig,
  ErrorMessages,
  GlobalErrorProps,
  SiteMetadata,
  LegacyLayoutConstants
} from "../types";

// Helper function to test interface structure
function testInterfaceStructure<T>(obj: T): T {
  return obj;
}

describe("App Types", () => {
  describe("Layout Component Types", () => {
    test("LayoutProps should accept ReactNode children", () => {
      const props: LayoutProps = {
        children: "test content"
      };
      expect(props.children).toBe("test content");

      // Should also accept JSX
      const propsWithJSX: LayoutProps = {
        children: null
      };
      expect(propsWithJSX.children).toBeNull();
    });

    test("FontConfig should have correct structure", () => {
      const fontConfig: FontConfig = testInterfaceStructure({
        variable: "--font-inter",
        subsets: ["latin"] as const
      });
      
      expect(fontConfig.variable).toBe("--font-inter");
      expect(fontConfig.subsets).toEqual(["latin"]);
    });

    test("IconConfig should have URL, sizes, and type", () => {
      const iconConfig: IconConfig = testInterfaceStructure({
        url: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon"
      });

      expect(iconConfig.url).toBe("/favicon.ico");
      expect(iconConfig.sizes).toBe("32x32");
      expect(iconConfig.type).toBe("image/x-icon");
    });

    test("OpenGraphImageConfig should include dimensions", () => {
      const ogImage: OpenGraphImageConfig = testInterfaceStructure({
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Site preview"
      });

      expect(ogImage.width).toBe(1200);
      expect(ogImage.height).toBe(630);
    });

    test("IconSetConfig should contain all required icons", () => {
      const iconSet: IconSetConfig = testInterfaceStructure({
        favicon32: { url: "/32.png", sizes: "32x32", type: "image/png" },
        favicon16: { url: "/16.png", sizes: "16x16", type: "image/png" },
        appleTouchIcon: { url: "/apple.png", sizes: "192x192", type: "image/png" },
        openGraphImage: { url: "/og.png", width: 512, height: 512, alt: "OG" }
      });

      expect(iconSet.favicon32).toBeDefined();
      expect(iconSet.favicon16).toBeDefined();
      expect(iconSet.appleTouchIcon).toBeDefined();
      expect(iconSet.openGraphImage).toBeDefined();
    });
  });

  describe("Homepage Content Types", () => {
    test("CtaButton should have text and href", () => {
      const button: CtaButton = testInterfaceStructure({
        text: "Click me",
        href: "/path"
      });

      expect(button.text).toBe("Click me");
      expect(button.href).toBe("/path");
    });

    test("FeatureCard should include CTA", () => {
      const feature: FeatureCard = testInterfaceStructure({
        title: "Feature Title",
        description: "Feature description",
        cta: { text: "Learn More", href: "/learn" }
      });

      expect(feature.cta.text).toBe("Learn More");
      expect(feature.cta.href).toBe("/learn");
    });

    test("HeroSection should have primary and secondary buttons", () => {
      const hero: HeroSection = testInterfaceStructure({
        mainHeading: "Main Title",
        subheading: "Subtitle",
        ctaButtons: {
          primary: { text: "Primary", href: "/primary" },
          secondary: { text: "Secondary", href: "/secondary" }
        }
      });

      expect(hero.ctaButtons.primary.text).toBe("Primary");
      expect(hero.ctaButtons.secondary.text).toBe("Secondary");
    });

    test("SolutionOverviewSection should have readonly features array", () => {
      const section: SolutionOverviewSection = testInterfaceStructure({
        heading: "Solutions",
        subheading: "Our solutions",
        features: [
          { title: "Feature 1", description: "Desc 1", cta: { text: "CTA", href: "/1" } }
        ] as const
      });

      expect(section.features).toHaveLength(1);
      expect(section.features[0].title).toBe("Feature 1");
    });

    test("AnnouncementConfig should have tag, title, and link", () => {
      const announcement: AnnouncementConfig = testInterfaceStructure({
        tag: "New",
        title: "Announcement",
        link: "/announcement"
      });

      expect(announcement.tag).toBe("New");
      expect(announcement.title).toBe("Announcement");
      expect(announcement.link).toBe("/announcement");
    });
  });

  describe("Animation Types", () => {
    test("MotionConfig should have initial, animate, and transition", () => {
      const motion: MotionConfig = testInterfaceStructure({
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
      });

      expect(motion.initial.opacity).toBe(0);
      expect(motion.animate.opacity).toBe(1);
      expect(motion.transition.duration).toBe(0.8);
    });

    test("MotionConfig transition delay should be optional", () => {
      const motionWithDelay: MotionConfig = testInterfaceStructure({
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
      });

      const motionWithoutDelay: MotionConfig = testInterfaceStructure({
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
      });

      expect(motionWithDelay.transition.delay).toBe(0.2);
      expect(motionWithoutDelay.transition.delay).toBeUndefined();
    });

    test("HeroAnimationConfig should contain all hero animations", () => {
      const heroAnim: HeroAnimationConfig = testInterfaceStructure({
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
      });

      expect(heroAnim.announcement).toBeDefined();
      expect(heroAnim.heading.transition.delay).toBe(0.2);
      expect(heroAnim.subheading.transition.delay).toBe(0.4);
      expect(heroAnim.buttons.transition.delay).toBe(0.6);
    });
  });

  describe("External Links Types", () => {
    test("ExternalLink should have url and text", () => {
      const link: ExternalLink = testInterfaceStructure({
        url: "https://example.com",
        text: "Example"
      });

      expect(link.url).toBe("https://example.com");
      expect(link.text).toBe("Example");
    });

    test("UnsplashCredit should have photographer and platform info", () => {
      const credit: UnsplashCredit = testInterfaceStructure({
        photographer: {
          name: "John Doe",
          url: "https://unsplash.com/@johndoe"
        },
        platform: {
          name: "Unsplash",
          url: "https://unsplash.com"
        }
      });

      expect(credit.photographer.name).toBe("John Doe");
      expect(credit.platform.name).toBe("Unsplash");
    });
  });

  describe("Error and Configuration Types", () => {
    test("GlobalErrorProps should accept Error with optional digest", () => {
      const errorProps: GlobalErrorProps = testInterfaceStructure({
        error: Object.assign(new Error("Test error"), { digest: "abc123" })
      });

      expect(errorProps.error.message).toBe("Test error");
      expect(errorProps.error.digest).toBe("abc123");

      // Should also work without digest
      const errorPropsNoDigest: GlobalErrorProps = testInterfaceStructure({
        error: new Error("Test error without digest")
      });

      expect(errorPropsNoDigest.error.message).toBe("Test error without digest");
      expect(errorPropsNoDigest.error.digest).toBeUndefined();
    });

    test("SiteMetadata should have mutable keywords array", () => {
      const metadata: SiteMetadata = testInterfaceStructure({
        title: "Site Title",
        siteName: "Site Name",
        description: "Site description",
        siteUrl: "https://site.com",
        themeColor: "#000000",
        keywords: ["keyword1", "keyword2"]
      });

      expect(metadata.keywords).toBeInstanceOf(Array);
      expect(metadata.keywords[0]).toBe("keyword1");
      
      // Should be mutable for Next.js
      metadata.keywords.push("new keyword");
      expect(metadata.keywords).toContain("new keyword");
    });

    test("PageStylingConfig should have all CSS classes", () => {
      const styling: PageStylingConfig = testInterfaceStructure({
        maxWidth: "max-w-4xl",
        padding: "px-4 py-8",
        gap: "gap-8",
        heroFontSizes: "text-6xl md:text-7xl",
        sectionSpacing: "space-y-8",
        gridCols: "grid-cols-3",
        loadingFallback: {
          container: "flex items-center",
          text: "Loading..."
        }
      });

      expect(styling.maxWidth).toBe("max-w-4xl");
      expect(styling.loadingFallback.text).toBe("Loading...");
    });
  });

  describe("Legacy Compatibility Types", () => {
    test("LegacyLayoutConstants should maintain backward compatibility", () => {
      const legacy: LegacyLayoutConstants = testInterfaceStructure({
        siteName: "Site",
        description: "Description",
        siteUrl: "https://site.com",
        themeColor: "#000",
        icons: {
          favicon32: { url: "/32.png", sizes: "32x32", type: "image/png" },
          favicon16: { url: "/16.png", sizes: "16x16", type: "image/png" },
          appleTouchIcon: { url: "/apple.png", sizes: "192x192", type: "image/png" },
          openGraphImage: { url: "/og.png", width: 512, height: 512, alt: "OG" }
        },
        manifest: "/manifest.json",
        dnsPreFetch: {
          googleFonts: "//fonts.googleapis.com",
          googleFontsStatic: "//fonts.gstatic.com"
        }
      });

      expect(legacy.siteName).toBe("Site");
      expect(legacy.icons.favicon32.url).toBe("/32.png");
      expect(legacy.manifest).toBe("/manifest.json");
    });
  });

  describe("Type Safety", () => {
    test("should enforce required properties", () => {
      // These should compile without errors
      const validButton: CtaButton = { text: "Button", href: "/path" };
      const validConfig: FontConfig = { variable: "--font", subsets: ["latin"] };
      
      expect(validButton.text).toBeDefined();
      expect(validConfig.variable).toBeDefined();
    });

    test("should allow optional properties", () => {
      const motionWithOptional: MotionConfig = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" } // delay is optional
      };

      const motionWithDelay: MotionConfig = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
      };

      expect(motionWithOptional.transition.delay).toBeUndefined();
      expect(motionWithDelay.transition.delay).toBe(0.2);
    });
  });
});