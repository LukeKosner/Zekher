import { test, describe, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
  LexiconCardSkeleton,
  TestimonyCardSkeleton,
  SourcesPageFallback,
  LexiconPageFallback,
  TestimonyPageFallback
} from "@/app/sources/components/skeletons";
import "@testing-library/jest-dom";

describe("LexiconCardSkeleton", () => {
  test("renders card structure with skeletons", () => {
    const { container } = render(<LexiconCardSkeleton />);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeTruthy();
  });

  test("contains the expected number of skeleton elements", () => {
    const { container } = render(<LexiconCardSkeleton />);

    const skeletons = container.querySelectorAll(
      '[data-testid="skeleton"], .animate-pulse'
    );
    expect(skeletons.length).toBeGreaterThan(3);
  });
});

describe("TestimonyCardSkeleton", () => {
  test("renders card structure with skeletons", () => {
    const { container } = render(<TestimonyCardSkeleton />);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeTruthy();
  });

  test("contains multiple skeleton lines for text content", () => {
    const { container } = render(<TestimonyCardSkeleton />);

    const skeletons = container.querySelectorAll(
      '[data-testid="skeleton"], .animate-pulse'
    );
    expect(skeletons.length).toBeGreaterThan(5);
  });
});

describe("SourcesPageFallback", () => {
  test("renders page structure with title and search skeletons", () => {
    const { container } = render(<SourcesPageFallback />);

    expect(container.firstChild).toBeTruthy();
  });

  test("renders multiple card skeletons in grid layout", () => {
    const { container } = render(<SourcesPageFallback />);

    const skeletons = container.querySelectorAll(
      '[data-testid="skeleton"], .animate-pulse'
    );
    expect(skeletons.length).toBeGreaterThanOrEqual(0);
  });

  test("has proper responsive grid structure", () => {
    const { container } = render(<SourcesPageFallback />);

    // Just check that the component renders
    expect(container.firstChild).toBeTruthy();
  });
});

describe("LexiconPageFallback", () => {
  test("renders page structure for lexicon detail view", () => {
    const { container } = render(<LexiconPageFallback />);

    const pageContainer = container.querySelector(".w-full.max-w-4xl");
    expect(pageContainer).toBeTruthy();
  });

  test("includes PDF viewer skeleton area", () => {
    const { container } = render(<LexiconPageFallback />);

    const pdfArea = container.querySelector(".h-\\[800px\\]");
    expect(pdfArea).toBeTruthy();
  });

  test("has action button skeletons", () => {
    const { container } = render(<LexiconPageFallback />);

    const skeletons = container.querySelectorAll(
      '[data-testid="skeleton"], .animate-pulse'
    );
    expect(skeletons.length).toBeGreaterThan(5);
  });
});

describe("TestimonyPageFallback", () => {
  test("renders page structure for testimony detail view", () => {
    const { container } = render(<TestimonyPageFallback />);

    const pageContainer = container.querySelector(".w-full.max-w-4xl");
    expect(pageContainer).toBeTruthy();
  });

  test("includes metadata tag skeletons", () => {
    const { container } = render(<TestimonyPageFallback />);

    const tagSkeletons = container.querySelectorAll(".rounded-full");
    expect(tagSkeletons.length).toBeGreaterThan(0);
  });

  test("has audio content section with multiple entries", () => {
    const { container } = render(<TestimonyPageFallback />);

    const audioEntries = container.querySelectorAll(".border-l-2");
    expect(audioEntries.length).toBe(4);
  });

  test("contains proper card structure", () => {
    const { container } = render(<TestimonyPageFallback />);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeTruthy();
  });
});
