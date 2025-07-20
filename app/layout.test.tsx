import { describe, test, expect } from "bun:test";

// Mock external dependencies
const mockClerkProvider = ({ children }: { children: React.ReactNode }) => <div data-testid="clerk-provider">{children}</div>;
const mockAnalytics = () => <div data-testid="analytics" />;
const mockClientSidebarLayout = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-layout">{children}</div>;

// Mock modules
import { mock } from "bun:test";

mock.module("@clerk/nextjs", () => ({
  ClerkProvider: mockClerkProvider
}));

mock.module("@vercel/analytics/next", () => ({
  Analytics: mockAnalytics
}));

mock.module("@/components/layout/ClientSidebarLayout", () => ({
  ClientSidebarLayout: mockClientSidebarLayout
}));

mock.module("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter", className: "inter-font" })
}));

mock.module("./layout.constants", () => ({
  siteMetadata: {
    siteName: "Test Site",
    description: "Test description",
    siteUrl: "https://test.com",
    themeColor: "#000000"
  },
  fontConfig: {
    variable: "--font-inter",
    subsets: ["latin"]
  },
  iconConfig: {
    favicon32: { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    favicon16: { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    appleTouchIcon: { url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
    openGraphImage: { url: "/og.png", width: 512, height: 512, alt: "Test" }
  },
  layoutConfig: {
    manifest: "/site.webmanifest",
    dnsPreFetch: {
      googleFonts: "//fonts.googleapis.com",
      googleFontsStatic: "//fonts.gstatic.com"
    }
  }
}));

mock.module("./types", () => ({
  LayoutProps: {}
}));

describe("RootLayout", () => {
  test("should export metadata with correct structure", () => {
    // Since we can't easily test the default export in this environment,
    // we'll test that the metadata export exists and has the right shape
    const { metadata } = require("./layout");
    
    expect(metadata).toBeDefined();
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.icons).toBeDefined();
    expect(metadata.manifest).toBeDefined();
  });

  test("should validate metadata structure", () => {
    const { metadata } = require("./layout");
    
    // Test OpenGraph structure
    expect(metadata.openGraph.title).toBeDefined();
    expect(metadata.openGraph.description).toBeDefined();
    expect(metadata.openGraph.url).toBeDefined();
    expect(metadata.openGraph.siteName).toBeDefined();
    expect(metadata.openGraph.type).toBe("website");
    expect(Array.isArray(metadata.openGraph.images)).toBe(true);
    
    // Test icons structure
    expect(Array.isArray(metadata.icons.icon)).toBe(true);
    expect(metadata.icons.apple).toBeDefined();
    
    // Test OpenGraph image structure
    const ogImage = metadata.openGraph.images[0];
    expect(ogImage.url).toBeDefined();
    expect(ogImage.width).toBeTypeOf("number");
    expect(ogImage.height).toBeTypeOf("number");
    expect(ogImage.alt).toBeDefined();
  });

  test("should have correct icon configuration", () => {
    const { metadata } = require("./layout");
    
    // Test favicon icons
    const icons = metadata.icons.icon;
    expect(icons.length).toBe(2);
    
    const favicon32 = icons.find((icon: any) => icon.sizes === "32x32");
    const favicon16 = icons.find((icon: any) => icon.sizes === "16x16");
    
    expect(favicon32).toBeDefined();
    expect(favicon32.url).toBe("/favicon-32x32.png");
    expect(favicon32.type).toBe("image/png");
    
    expect(favicon16).toBeDefined();
    expect(favicon16.url).toBe("/favicon-16x16.png");
    expect(favicon16.type).toBe("image/png");
    
    // Test apple touch icon
    expect(metadata.icons.apple.url).toBe("/apple-touch-icon.png");
    expect(metadata.icons.apple.sizes).toBe("192x192");
    expect(metadata.icons.apple.type).toBe("image/png");
  });

  test("should have manifest reference", () => {
    const { metadata } = require("./layout");
    expect(metadata.manifest).toBe("/site.webmanifest");
  });

  test("should use layout constants from co-located constants file", () => {
    const { siteMetadata, layoutConfig } = require("./layout.constants");
    const { metadata } = require("./layout");
    
    expect(metadata.title).toBe(siteMetadata.siteName);
    expect(metadata.description).toBe(siteMetadata.description);
    expect(metadata.openGraph.url).toBe(siteMetadata.siteUrl);
    expect(metadata.manifest).toBe(layoutConfig.manifest);
  });
});