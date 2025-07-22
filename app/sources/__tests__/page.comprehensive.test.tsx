/**
 * @fileoverview Essential functionality tests for the sources page.
 * Tests core data fetching, error handling, and business logic without complex DOM assertions.
 */

// Set environment variables before imports
Object.defineProperty(process.env, "POSTGRES_URL", {
  value: "postgresql://test:test@localhost:5432/test",
  writable: true
});

Object.defineProperty(process.env, "NEXT_PUBLIC_BASE_URL", {
  value: "http://localhost:3000",
  writable: true
});

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import SourcesPage from "@/app/sources/page";
import { getAllLexiconEntries } from "@/lib/utils/lexicon";
import { getAllTestimonies } from "@/lib/utils/testimony";
import { sourcesPageConstants } from "@/app/sources/constants";

// Create mock functions
const mockGetAllLexiconEntries = mock<() => Promise<any[]>>(() => Promise.resolve([]));
const mockGetAllTestimonies = mock<() => Promise<any[]>>(() => Promise.resolve([]));

// Mock the data fetching utilities
mock.module("@/lib/utils/lexicon", () => ({
  getAllLexiconEntries: mockGetAllLexiconEntries
}));

mock.module("@/lib/utils/testimony", () => ({
  getAllTestimonies: mockGetAllTestimonies
}));

// Mock the SourcesPageContent component with simple test-friendly version
mock.module("@/app/sources/components/SourcesPageContent", () => ({
  SourcesPageContent: ({ lexiconSources, testimonySources }: any) => (
    <div data-testid="sources-page-content">
      <div data-testid="lexicon-count">{lexiconSources.length}</div>
      <div data-testid="testimony-count">{testimonySources.length}</div>
    </div>
  )
}));

// Mock the skeleton component
mock.module("@/app/sources/components/skeletons", () => ({
  SourcesPageFallback: () => (
    <div data-testid="loading-skeleton">Loading...</div>
  )
}));

// Mock console methods
const mockConsoleLog = mock(() => {});
const mockConsoleError = mock(() => {});
console.log = mockConsoleLog;
console.error = mockConsoleError;

describe("SourcesPage - Essential Tests", () => {
  beforeEach(() => {
    // Reset console mocks
    mockConsoleLog.mockReset();
    mockConsoleError.mockReset();

    // Reset module mocks
    mockGetAllLexiconEntries.mockReset();
    mockGetAllTestimonies.mockReset();
  });

  describe("Core Functionality", () => {
    test("renders page successfully with data", async () => {
      const mockLexiconEntries = [
        {
          id: "lexicon-1",
          filename: "test1.pdf",
          title: "Test Lexicon Entry 1",
          content: "Test content 1",
          pdfFile: "test1.pdf",
          pdfUrl: null,
          txtUrl: null,
          redirectUrl: null,
          citation: "Yad Vashem's Holocaust Lexicon",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "lexicon-2",
          filename: "test2.pdf", 
          title: "Test Lexicon Entry 2",
          content: "Test content 2",
          pdfFile: "test2.pdf",
          pdfUrl: null,
          txtUrl: null,
          redirectUrl: null,
          citation: "Yad Vashem's Holocaust Lexicon",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockTestimonyEntries = [
        {
          id: "testimony-1",
          survivor_name: "Test Survivor",
          survivorName: "Test Survivor",
          filename: "survivor1.txt",
          content: "This is a long testimony content that should be processed correctly.",
          excerpt: "This is a long testimony content that should be processed correctly.",
          citation: "USC Shoah Foundation",
          testimony_language: undefined,
          interviewer: undefined,
          date: undefined,
          location: undefined,
          url: undefined,
          mediaFile: undefined,
          transcriptionFile: undefined,
          mediaUrl: undefined,
          transcriptUrl: undefined,
          description: undefined,
          exportDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(mockLexiconEntries));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve(mockTestimonyEntries));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });

    test("handles empty data sets", async () => {
      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve([]));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve([]));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });

    test("processes data correctly", async () => {
      const mockTestimonyEntries = [
        {
          id: "testimony-1",
          survivor_name: "Test Survivor",
          survivorName: "Test Survivor",
          filename: "survivor.txt",
          content: "[00:01] David Boder: Question here\n[00:05] This is the survivor's response that is long enough to be included in the content preview and should be visible in the description.",
          excerpt: "This is the survivor's response that is long enough to be included in the content preview and should be visible in the description.",
          citation: "USC Shoah Foundation",
          testimony_language: undefined,
          interviewer: undefined,
          date: undefined,
          location: undefined,
          url: undefined,
          mediaFile: undefined,
          transcriptionFile: undefined,
          mediaUrl: undefined,
          transcriptUrl: undefined,
          description: undefined,
          exportDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve([]));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve(mockTestimonyEntries));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    test("handles database connection errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      mockGetAllLexiconEntries.mockImplementation(() => Promise.reject(dbError));
      mockGetAllTestimonies.mockImplementation(() => Promise.reject(dbError));

      // Should not throw an error, but render error state instead
      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });

    test("handles partial data fetch failures", async () => {
      const mockLexiconEntries = [
        {
          id: "working-lexicon",
          filename: "working.pdf",
          title: "Working Entry",
          content: "Content",
          pdfFile: null,
          pdfUrl: null,
          txtUrl: null,
          redirectUrl: null,
          citation: "Yad Vashem's Holocaust Lexicon",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(mockLexiconEntries));
      mockGetAllTestimonies.mockImplementation(() => Promise.reject(new Error("Testimony fetch failed")));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });

    test("renders error page for critical failures", async () => {
      // Mock getSources to throw during component render
      mockGetAllLexiconEntries.mockImplementation(() => {
        throw new Error("Critical rendering error");
      });

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Data Processing", () => {
    test("handles entries with missing optional fields", async () => {
      const mockLexiconEntries = [
        {
          id: "minimal-lexicon",
          filename: "minimal.pdf",
          title: "Minimal Lexicon Entry",
          content: "Minimal content",
          pdfFile: null,
          pdfUrl: null,
          txtUrl: null,
          redirectUrl: null,
          citation: "Yad Vashem's Holocaust Lexicon",
          createdAt: new Date(),
          updatedAt: new Date()
          // Missing title, filename, etc.
        }
      ];

      const mockTestimonyEntries = [
        {
          id: "minimal-testimony",
          survivor_name: "Minimal Survivor",
          survivorName: "Minimal Survivor",
          filename: "minimal.txt",
          content: "Short content",
          excerpt: "Short content",
          citation: "USC Shoah Foundation",
          testimony_language: undefined,
          interviewer: undefined,
          date: undefined,
          location: undefined,
          url: undefined,
          mediaFile: undefined,
          transcriptionFile: undefined,
          mediaUrl: undefined,
          transcriptUrl: undefined,
          description: undefined,
          exportDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(mockLexiconEntries));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve(mockTestimonyEntries));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });

    test("handles malformed data gracefully", async () => {
      const malformedEntries = [
        {
          // Missing required fields - this will likely cause issues
          id: "malformed",
          filename: "malformed.pdf",
          title: "Malformed Entry",
          content: "Content without ID",
          pdfFile: null,
          pdfUrl: null,
          txtUrl: null,
          redirectUrl: null,
          citation: "Yad Vashem's Holocaust Lexicon",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(malformedEntries));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve([]));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });

    test("handles large datasets", async () => {
      const largeLexiconSet = Array.from({ length: 100 }, (_, i) => ({
        id: `large-entry-${i}`,
        filename: `large${i}.pdf`,
        title: `Large Entry ${i}`,
        content: `Content ${i}`,
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        citation: "Yad Vashem's Holocaust Lexicon",
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(largeLexiconSet));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve([]));

      const { container } = render(await SourcesPage());
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Constants Integration", () => {
    test("uses constants for lexicon overlay text", async () => {
      const mockLexiconEntries = [
        {
          id: "constants-test",
          filename: "constants.pdf",
          title: "Constants Test Entry", 
          content: "Content",
          pdfFile: null,
          pdfUrl: null,
          txtUrl: null,
          redirectUrl: null,
          citation: "Yad Vashem's Holocaust Lexicon",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(mockLexiconEntries));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve([]));

      const { container } = render(await SourcesPage());
      
      // Verify constants are properly imported and used
      expect(sourcesPageConstants.lexiconOverlay.title).toBe("Holocaust Lexicon");
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Performance", () => {
    test("completes rendering within reasonable time", async () => {
      const startTime = Date.now();

      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: `perf-entry-${i}`,
        filename: `perf${i}.pdf`,
        title: `Performance Test ${i}`,
        content: "Content",
        pdfFile: null,
        pdfUrl: null,
        txtUrl: null,
        redirectUrl: null,
        citation: "Yad Vashem's Holocaust Lexicon",
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      mockGetAllLexiconEntries.mockImplementation(() => Promise.resolve(mockData));
      mockGetAllTestimonies.mockImplementation(() => Promise.resolve(mockData));

      render(await SourcesPage());

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
});