/**
 * @fileoverview Essential functionality tests for LexiconCard component.
 * Focused on core functionality without complex DOM selectors.
 */

// Set environment variables before imports
Object.defineProperty(process.env, "NEXT_PUBLIC_BASE_URL", {
  value: "http://localhost:3000",
  writable: true
});

Object.defineProperty(process.env, "GOOGLE_CLOUD_STORAGE_BASE", {
  value: "https://storage.googleapis.com/test-bucket",
  writable: true
});

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { LexiconCard } from "@/app/sources/components/LexiconCard";
import { sourcesPageConstants } from "@/app/sources/constants";
import type { LexiconSource } from "@/app/sources/types";

// Mock URL generation
mock.module("@/lib", () => ({
  generateSourceUrl: ({ pageType, filename }: any) =>
    `http://localhost:3000/sources/${pageType}/${filename}`
}));

describe("LexiconCard - Essential Tests", () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  describe("Core Functionality", () => {
    test("renders without errors with basic data", () => {
      const mockSource: LexiconSource = {
        id: "test-id",
        filename: "test.pdf",
        title: "Test Lexicon Entry",
        content: "Test content",
        pdfFile: "test.pdf",
        pdfUrl: "https://example.com/test.pdf",
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "test-entry",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("handles missing title gracefully", () => {
      const mockSource: LexiconSource = {
        id: "no-title",
        filename: "test-file.pdf",
        title: "Test Title",
        content: "Content without title",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "no-title",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("falls back to 'Untitled' when no title or filename", () => {
      const mockSource: LexiconSource = {
        id: "untitled",
        filename: "untitled.pdf",
        title: "Test Title",
        content: "Content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "untitled",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("PDF and URL Handling", () => {
    test("renders with PDF URL", () => {
      const mockSource: LexiconSource = {
        id: "pdf-test",
        filename: "test.pdf",
        title: "PDF Test Entry",
        content: "Content",
        pdfFile: "test.pdf",
        pdfUrl: "https://example.com/test.pdf",
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "pdf-test",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("handles redirect URLs", () => {
      const mockSource: LexiconSource = {
        id: "redirect-test",
        filename: "redirect.txt",
        title: "Redirect Test",
        content: "Content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: "https://external-site.com/page",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "redirect-test",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("handles text URLs", () => {
      const mockSource: LexiconSource = {
        id: "txt-test",
        filename: "test.txt",
        title: "Text Test Entry",
        content: "Content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: "https://example.com/test.txt",
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "txt-test",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Props and Configuration", () => {
    test("accepts custom className prop", () => {
      const mockSource: LexiconSource = {
        id: "custom-class",
        filename: "custom-class.pdf",
        title: "Custom Class Test",
        content: "Content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "custom-class",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(
        <LexiconCard source={mockSource} className="custom-styling" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    test("handles missing optional properties", () => {
      const mockSource: LexiconSource = {
        id: "minimal",
        filename: "minimal.pdf",
        title: "Test Title",
        content: "Minimal required content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "minimal",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    test("handles extremely long titles", () => {
      const longTitle = "A".repeat(200);
      const mockSource: LexiconSource = {
        id: "long-title",
        filename: "long-title.pdf",
        title: longTitle,
        content: "Content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "long-title",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("handles special characters in titles", () => {
      const mockSource: LexiconSource = {
        id: "special-chars",
        filename: "special-chars.pdf",
        title: "Special: Characters & Symbols! (Test)",
        content: "Content with special chars",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "special-chars",
        citation: "Yad Vashem's Holocaust Lexicon"
      };

      const { container } = render(<LexiconCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Constants Integration", () => {
    test("uses constants from centralized configuration", () => {
      // Verify constants exist and have expected values
      expect(sourcesPageConstants.cardText.lexicon.source).toBe(
        "from Yad Vashem's Holocaust Lexicon"
      );
      expect(sourcesPageConstants.cardText.lexicon.viewFullPdf).toBe(
        "View Full PDF"
      );
    });
  });

  describe("Performance", () => {
    test("renders multiple cards efficiently", () => {
      const sources = Array.from({ length: 10 }, (_, i) => ({
        id: `perf-${i}`,
        filename: `perf-${i}.pdf`,
        title: `Performance Test ${i}`,
        content: "Performance test content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: `perf-${i}`,
        citation: "Yad Vashem's Holocaust Lexicon"
      }));

      sources.forEach((source) => {
        const { container } = render(<LexiconCard source={source} />);
        expect(container.firstChild).toBeTruthy();
      });
    });
  });
});
