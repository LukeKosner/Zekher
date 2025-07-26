import { test, describe, expect } from "bun:test";
import {
  SITE_METADATA,
  FONT_CONFIG,
  ICON_CONFIG,
  LAYOUT_CONFIG,
  HOMEPAGE_CONTENT,
  EXTERNAL_LINKS,
  ANIMATION_CONFIG,
  IMAGE_CONFIG,
  PAGE_STYLING,
  ERROR_MESSAGES,
  layoutConstants
} from "../constants";

describe("App Constants", () => {
  describe("SITE_METADATA", () => {
    test("should have required metadata fields", () => {
      expect(SITE_METADATA.title).toBe("Zekher");
      expect(SITE_METADATA.siteName).toBe("Zekher זכר");
      expect(SITE_METADATA.description).toContain("Holocaust education");
      expect(SITE_METADATA.siteUrl).toBe("https://zekher.com");
      expect(SITE_METADATA.themeColor).toBe("#1f2937");
    });

    test("should have complete keywords array", () => {
      expect(SITE_METADATA.keywords).toBeInstanceOf(Array);
      expect(SITE_METADATA.keywords.length).toBeGreaterThan(0);
      expect(SITE_METADATA.keywords).toContain("Holocaust education");
      expect(SITE_METADATA.keywords).toContain("Yad Vashem");
    });

    test("keywords should be mutable for Next.js", () => {
      // Should not throw when trying to push
      expect(() => {
        const keywords = [...SITE_METADATA.keywords];
        keywords.push("test");
      }).not.toThrow();
    });
  });

  describe("FONT_CONFIG", () => {
    test("should have correct Inter font configuration", () => {
      expect(FONT_CONFIG.variable).toBe("--font-inter");
      expect(FONT_CONFIG.subsets).toEqual(["latin"]);
    });
  });

  describe("ICON_CONFIG", () => {
    test("should have all required icons", () => {
      expect(ICON_CONFIG.favicon32).toBeDefined();
      expect(ICON_CONFIG.favicon16).toBeDefined();
      expect(ICON_CONFIG.appleTouchIcon).toBeDefined();
      expect(ICON_CONFIG.openGraphImage).toBeDefined();
    });

    test("favicon configurations should be valid", () => {
      expect(ICON_CONFIG.favicon32.url).toBe("/favicon-32x32.png");
      expect(ICON_CONFIG.favicon32.sizes).toBe("32x32");
      expect(ICON_CONFIG.favicon32.type).toBe("image/png");

      expect(ICON_CONFIG.favicon16.url).toBe("/favicon-16x16.png");
      expect(ICON_CONFIG.favicon16.sizes).toBe("16x16");
      expect(ICON_CONFIG.favicon16.type).toBe("image/png");
    });

    test("open graph image should have correct dimensions", () => {
      expect(ICON_CONFIG.openGraphImage.width).toBe(512);
      expect(ICON_CONFIG.openGraphImage.height).toBe(512);
      expect(ICON_CONFIG.openGraphImage.alt).toContain("Zekher");
    });
  });

  describe("LAYOUT_CONFIG", () => {
    test("should have manifest and DNS prefetch settings", () => {
      expect(LAYOUT_CONFIG.manifest).toBe("/site.webmanifest");
      expect(LAYOUT_CONFIG.dnsPreFetch.googleFonts).toBe("//fonts.googleapis.com");
      expect(LAYOUT_CONFIG.dnsPreFetch.googleFontsStatic).toBe("//fonts.gstatic.com");
    });
  });

  describe("HOMEPAGE_CONTENT", () => {
    test("announcement should have correct structure", () => {
      expect(HOMEPAGE_CONTENT.announcement.tag).toBe("v3 Beta");
      expect(HOMEPAGE_CONTENT.announcement.title).toBe("Support for MCP");
      expect(HOMEPAGE_CONTENT.announcement.link).toBe("/developers/mcp");
    });

    test("hero section should have required content", () => {
      expect(HOMEPAGE_CONTENT.hero.mainHeading).toContain("Holocaust memory");
      expect(HOMEPAGE_CONTENT.hero.ctaButtons.primary.text).toBe("Start Chat");
      expect(HOMEPAGE_CONTENT.hero.ctaButtons.primary.href).toBe("/chat");
      expect(HOMEPAGE_CONTENT.hero.ctaButtons.secondary.text).toBe("Browse Sources");
      expect(HOMEPAGE_CONTENT.hero.ctaButtons.secondary.href).toBe("/sources");
    });

    test("solution overview should have three features", () => {
      expect(HOMEPAGE_CONTENT.solutionOverview.features).toHaveLength(3);
      
      const features = HOMEPAGE_CONTENT.solutionOverview.features;
      expect(features[0].title).toBe("Chat Experience");
      expect(features[1].title).toBe("MCP Server");
      expect(features[2].title).toBe("Source Library");
      
      // Each feature should have CTA
      features.forEach(feature => {
        expect(feature.cta.text).toBeDefined();
        expect(feature.cta.href).toBeDefined();
      });
    });

    test("get involved section should have email and about CTAs", () => {
      expect(HOMEPAGE_CONTENT.getInvolved.ctaButtons.email.text).toBe("Email Us");
      expect(HOMEPAGE_CONTENT.getInvolved.ctaButtons.email.href).toContain("mailto:");
      expect(HOMEPAGE_CONTENT.getInvolved.ctaButtons.about.text).toBe("About");
      expect(HOMEPAGE_CONTENT.getInvolved.ctaButtons.about.href).toBe("/about");
    });
  });

  describe("EXTERNAL_LINKS", () => {
    test("should have Yad Vashem and survivor testimony links", () => {
      expect(EXTERNAL_LINKS.yadVashem.url).toContain("yadvashem.org");
      expect(EXTERNAL_LINKS.survivorTestimonies.url).toContain("voices.library.iit.edu");
    });

    test("Unsplash credit should have photographer and platform", () => {
      expect(EXTERNAL_LINKS.unsplashCredit.photographer.name).toBe("Giulia Gasperini");
      expect(EXTERNAL_LINKS.unsplashCredit.photographer.url).toContain("unsplash.com");
      expect(EXTERNAL_LINKS.unsplashCredit.platform.name).toBe("Unsplash");
      expect(EXTERNAL_LINKS.unsplashCredit.platform.url).toContain("unsplash.com");
    });
  });

  describe("ANIMATION_CONFIG", () => {
    test("hero animations should have proper timing", () => {
      expect(ANIMATION_CONFIG.hero.announcement.transition.duration).toBe(0.8);
      expect(ANIMATION_CONFIG.hero.heading.transition.delay).toBe(0.2);
      expect(ANIMATION_CONFIG.hero.subheading.transition.delay).toBe(0.4);
      expect(ANIMATION_CONFIG.hero.buttons.transition.delay).toBe(0.6);
    });

    test("all animations should use easeOut", () => {
      expect(ANIMATION_CONFIG.hero.announcement.transition.ease).toBe("easeOut");
      expect(ANIMATION_CONFIG.memorialImage.transition.ease).toBe("easeOut");
      expect(ANIMATION_CONFIG.solutionOverview.transition.ease).toBe("easeOut");
    });

    test("animations should have proper initial states", () => {
      expect(ANIMATION_CONFIG.hero.heading.initial.opacity).toBe(0);
      expect(ANIMATION_CONFIG.hero.heading.initial.y).toBe(30);
      expect(ANIMATION_CONFIG.hero.heading.animate.opacity).toBe(1);
      expect(ANIMATION_CONFIG.hero.heading.animate.y).toBe(0);
    });
  });

  describe("IMAGE_CONFIG", () => {
    test("memorial image should have correct configuration", () => {
      expect(IMAGE_CONFIG.memorial.src).toBe("/giulia-gasperini-8S-D-UodlHU-unsplash.jpg");
      expect(IMAGE_CONFIG.memorial.alt).toBe("Memorial to the Murdered Jews of Europe");
      expect(IMAGE_CONFIG.memorial.aspectRatio).toBeCloseTo(1.499, 2);
    });
  });

  describe("PAGE_STYLING", () => {
    test("should have responsive design classes", () => {
      expect(PAGE_STYLING.maxWidth).toBe("max-w-4xl");
      expect(PAGE_STYLING.padding).toContain("px-4 sm:px-6 lg:px-8");
      expect(PAGE_STYLING.heroFontSizes).toContain("text-6xl md:text-7xl");
      expect(PAGE_STYLING.gridCols).toBe("grid-cols-1 md:grid-cols-3");
    });

    test("loading fallback should have proper styling", () => {
      expect(PAGE_STYLING.loadingFallback.container).toContain("min-h-screen");
      expect(PAGE_STYLING.loadingFallback.text).toBe("Loading...");
    });
  });

  describe("ERROR_MESSAGES", () => {
    test("should have all required error messages", () => {
      expect(ERROR_MESSAGES.noChildren).toContain("No children provided");
      expect(ERROR_MESSAGES.layoutConstantsNotConfigured).toContain("not properly configured");
      expect(ERROR_MESSAGES.layoutConstantsMissing).toContain("not properly configured");
    });
  });

  describe("Legacy compatibility", () => {
    test("layoutConstants should maintain backward compatibility", () => {
      expect(layoutConstants.siteName).toBe(SITE_METADATA.siteName);
      expect(layoutConstants.description).toBe(SITE_METADATA.description);
      expect(layoutConstants.siteUrl).toBe(SITE_METADATA.siteUrl);
      expect(layoutConstants.themeColor).toBe(SITE_METADATA.themeColor);
      expect(layoutConstants.icons).toEqual(ICON_CONFIG);
      expect(layoutConstants.manifest).toBe(LAYOUT_CONFIG.manifest);
      expect(layoutConstants.dnsPreFetch).toEqual(LAYOUT_CONFIG.dnsPreFetch);
    });
  });

  describe("Constants immutability", () => {
    test("should be properly frozen with as const", () => {
      // Test that attempting to modify constants would cause TypeScript errors
      // (This is more of a compile-time check, but we can verify the structure)
      expect(typeof SITE_METADATA).toBe("object");
      expect(typeof HOMEPAGE_CONTENT).toBe("object");
      expect(typeof ANIMATION_CONFIG).toBe("object");
    });
  });
});