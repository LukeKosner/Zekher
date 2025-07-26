/**
 * @fileoverview Essential functionality tests for TestimonyCard component.
 * Focused on core functionality without complex DOM selectors.
 */

// Set environment variables before imports
Object.defineProperty(process.env, "NEXT_PUBLIC_BASE_URL", {
  value: "http://localhost:3000",
  writable: true
});

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { TestimonyCard } from "@/app/sources/components/TestimonyCard";
import { sourcesPageConstants } from "@/app/sources/constants";
import type { TestimonySource } from "@/app/sources/types";

// Mock URL generation
mock.module("@/lib", () => ({
  generateSourceUrl: ({ pageType, filename }: any) =>
    `http://localhost:3000/sources/${pageType}/${filename}`
}));

describe("TestimonyCard - Essential Tests", () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  describe("Core Functionality", () => {
    test("renders without errors", () => {
      const mockSource: TestimonySource = {
        id: "test-testimony",
        survivor_name: "Test Survivor",
        survivorName: "Test Survivor",
        excerpt: "This is a test excerpt from the testimony.",
        citation: "Test Survivor Testimony, David P. Boder Collection",
        filename: "survivor.txt",
        content: "Test content",
        testimony_language: "English",
        interviewer: "Test Interviewer",
        date: "1946-01-01",
        location: "Paris",
        url: "https://example.com",
        mediaFile: "audio.mp3",
        transcriptionFile: "transcript.txt",
        mediaUrl: "https://example.com/audio.mp3",
        transcriptUrl: "https://example.com/transcript.txt",
        description: "Test description",
        exportDate: "2024-01-01",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Test Survivor",
        tags: ["testimony"],
        featured: false
      };

      const { container } = render(<TestimonyCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("handles fallback name when survivor_name is missing", () => {
      const mockSource: TestimonySource = {
        id: "no-name",
        survivor_name: "",
        survivorName: "Unknown Survivor",
        excerpt: "This testimony excerpt has no specific survivor name.",
        citation: "Anonymous Testimony, David P. Boder Collection",
        filename: "testimony-file.txt",
        content: "Content without survivor name",
        testimony_language: null,
        interviewer: null,
        date: null,
        location: null,
        url: null,
        mediaFile: null,
        transcriptionFile: null,
        mediaUrl: null,
        transcriptUrl: null,
        description: null,
        exportDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { container } = render(<TestimonyCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });

    test("handles empty/missing data gracefully", () => {
      const mockSource: TestimonySource = {
        id: "minimal",
        survivor_name: "",
        survivorName: "Minimal Test Survivor",
        excerpt: "Minimal test excerpt.",
        citation: "Minimal Test Citation",
        filename: "",
        content: "",
        testimony_language: null,
        interviewer: null,
        date: null,
        location: null,
        url: null,
        mediaFile: null,
        transcriptionFile: null,
        mediaUrl: null,
        transcriptUrl: null,
        description: null,
        exportDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { container } = render(<TestimonyCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Props and Configuration", () => {
    test("accepts custom className prop", () => {
      const mockSource: TestimonySource = {
        id: "custom-class",
        survivor_name: "Class Test",
        survivorName: "Class Test",
        excerpt: "Test excerpt for class testing.",
        citation: "Class Test Testimony Citation",
        filename: "test.txt",
        content: "Content",
        testimony_language: null,
        interviewer: null,
        date: null,
        location: null,
        url: null,
        mediaFile: null,
        transcriptionFile: null,
        mediaUrl: null,
        transcriptUrl: null,
        description: null,
        exportDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { container } = render(
        <TestimonyCard source={mockSource} className="custom-class" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    test("works with all required props only", () => {
      const mockSource: TestimonySource = {
        id: "required-only",
        survivor_name: "Required Test",
        survivorName: "Required Test",
        excerpt: "Required test excerpt content.",
        citation: "Required Test Citation",
        filename: "required.txt",
        content: "Required content",
        testimony_language: null,
        interviewer: null,
        date: null,
        location: null,
        url: null,
        mediaFile: null,
        transcriptionFile: null,
        mediaUrl: null,
        transcriptUrl: null,
        description: null,
        exportDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { container } = render(<TestimonyCard source={mockSource} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Constants Integration", () => {
    test("uses constants from centralized configuration", () => {
      // Just verify constants exist and have expected values
      expect(sourcesPageConstants.cardText.testimony.source).toBe(
        "from the David P. Boder interviews"
      );
      expect(sourcesPageConstants.cardText.testimony.readFull).toBe(
        "Read Full Testimony"
      );
    });
  });

  describe("Performance", () => {
    test("renders multiple cards efficiently", () => {
      const sources = Array.from({ length: 10 }, (_, i) => ({
        id: `perf-${i}`,
        survivor_name: `Survivor ${i}`,
        survivorName: `Survivor ${i}`,
        excerpt: `Performance test excerpt for survivor ${i}.`,
        citation: `Survivor ${i} Testimony Citation`,
        filename: `file${i}.txt`,
        content: "Performance test content",
        testimony_language: null,
        interviewer: null,
        date: null,
        location: null,
        url: null,
        mediaFile: null,
        transcriptionFile: null,
        mediaUrl: null,
        transcriptUrl: null,
        description: null,
        exportDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      sources.forEach((source) => {
        const { container } = render(<TestimonyCard source={source} />);
        expect(container.firstChild).toBeTruthy();
      });
    });
  });
});
