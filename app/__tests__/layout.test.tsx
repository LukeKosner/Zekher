import { test, describe, expect, mock, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import RootLayout, { metadata } from "../layout";
import "@testing-library/jest-dom";

// Mock dependencies
mock.module("@vercel/analytics/next", () => ({
  Analytics: mock(() => null)
}));

mock.module("@/components/layout/ClientSidebarLayout", () => ({
  ClientSidebarLayout: mock(({ children }: { children: React.ReactNode }) => 
    <div data-testid="client-sidebar-layout">{children}</div>
  )
}));

mock.module("next/font/google", () => ({
  Inter: mock(() => ({
    variable: "--font-inter"
  }))
}));

// Mock Sentry
const mockLogger = {
  warn: mock(),
  error: mock()
};

const mockCaptureMessage = mock();

mock.module("@sentry/nextjs", () => ({
  logger: mockLogger,
  captureMessage: mockCaptureMessage
}));

describe("RootLayout", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockCaptureMessage.mockClear();
  });

  describe("Component rendering", () => {
    test("should render children correctly", () => {
      const testContent = "Test page content";
      
      render(
        <RootLayout>
          <div>{testContent}</div>
        </RootLayout>
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
      expect(screen.getByTestId("client-sidebar-layout")).toBeInTheDocument();
    });

    test("should render fallback when no children provided", () => {
      render(<RootLayout>{null}</RootLayout>);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(mockLogger.warn).toHaveBeenCalledWith("RootLayout: No children provided");
    });

    test("should have proper HTML structure", () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      );

      // Check for html lang attribute
      const htmlElement = document.documentElement;
      expect(htmlElement.getAttribute("lang")).toBe("en");
    });

    test("should include Inter font class", () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      );

      const bodyElement = document.body;
      expect(bodyElement.className).toContain("--font-inter");
      expect(bodyElement.className).toContain("antialiased");
    });
  });

  describe("Error handling and validation", () => {
    test("should log warning when no children provided", () => {
      render(<RootLayout>{null}</RootLayout>);

      expect(mockLogger.warn).toHaveBeenCalledWith("RootLayout: No children provided");
    });

    test("should handle layout constants validation", () => {
      // Since constants are imported, they should be valid
      // But we can test the error handling logic would work
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      );

      // No errors should be logged with valid constants
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockCaptureMessage).not.toHaveBeenCalled();
    });
  });

  describe("Meta elements", () => {
    test("should include DNS prefetch links", () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      );

      // Check that DNS prefetch links are in the document
      const dnsLinks = document.querySelectorAll('link[rel="dns-prefetch"]');
      expect(dnsLinks.length).toBeGreaterThan(0);
    });

    test("should include theme color meta tag", () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      );

      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      expect(themeColorMeta).toBeTruthy();
      expect(themeColorMeta?.getAttribute("content")).toBe("#1f2937");
    });
  });

  describe("Integration with components", () => {
    test("should render ClientSidebarLayout wrapper", () => {
      render(
        <RootLayout>
          <div>Test content</div>
        </RootLayout>
      );

      expect(screen.getByTestId("client-sidebar-layout")).toBeInTheDocument();
    });

    test("should include Analytics component", () => {
      // Analytics is rendered in head, so we just verify it doesn't break
      expect(() => {
        render(
          <RootLayout>
            <div>Content</div>
          </RootLayout>
        );
      }).not.toThrow();
    });
  });
});

describe("Layout metadata", () => {
  test("should export correct metadata", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("Zekher");
    expect(metadata.description).toContain("Holocaust education");
  });

  test("should have OpenGraph metadata", () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBe("Zekher");
    expect(metadata.openGraph?.type).toBe("website");
    expect(metadata.openGraph?.url).toBe("https://zekher.com");
  });

  test("should have icon configuration", () => {
    expect(metadata.icons).toBeDefined();
    expect(metadata.icons?.icon).toBeDefined();
    expect(metadata.icons?.apple).toBeDefined();
  });

  test("should have manifest", () => {
    expect(metadata.manifest).toBe("/site.webmanifest");
  });

  test("should have keywords", () => {
    expect(metadata.keywords).toBeDefined();
    expect(Array.isArray(metadata.keywords)).toBe(true);
    expect((metadata.keywords as string[]).length).toBeGreaterThan(0);
  });
});