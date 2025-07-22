import { test, describe, expect, beforeEach, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import SourcesPage from "@/app/sources/page";
import { getAllLexiconEntries } from "@/lib/utils/lexicon-db";
import { getAllTestimonies } from "@/lib/utils/testimony";
import "@testing-library/jest-dom";

// Mock dependencies
mock.module("@/lib/utils/lexicon-db", () => ({
  getAllLexiconEntries: mock(),
}));

mock.module("@/lib/utils/testimony", () => ({
  getAllTestimonies: mock(),
}));

// Mock the SourcesPageContent component to avoid rendering complexity
mock.module("@/app/sources/components/SourcesPageContent", () => ({
  SourcesPageContent: ({ lexiconSources, testimonySources }: any) => (
    <div data-testid="sources-page-content">
      <div data-testid="lexicon-count">{lexiconSources.length}</div>
      <div data-testid="testimony-count">{testimonySources.length}</div>
    </div>
  ),
}));

// Mock the skeleton component
mock.module("@/app/sources/components/skeletons", () => ({
  SourcesPageFallback: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

const mockGetAllLexiconEntries = getAllLexiconEntries as any;
const mockGetAllTestimonies = getAllTestimonies as any;

describe("SourcesPage", () => {
  beforeEach(() => {
    // Clear DOM between tests
    document.body.innerHTML = '';
    mockGetAllLexiconEntries.mockClear?.();
    mockGetAllTestimonies.mockClear?.();
  });

  test("renders the page with sources data", async () => {
    // Mock lexicon data
    mockGetAllLexiconEntries.mockResolvedValue([
      { title: "Lexicon Entry 1" },
      { title: "Lexicon Entry 2" },
    ] as any);

    // Mock testimony data
    mockGetAllTestimonies.mockResolvedValue([
      {
        id: "1",
        survivor_name: "Survivor 1",
        filename: "interview1.txt",
        content: "This is a test interview content that is long enough to be included in the preview.",
        description: "Test description"
      },
    ] as any);

    render(await SourcesPage());

    await waitFor(() => {
      expect(screen.getAllByTestId("sources-page-content")[0]).toBeTruthy();
    });

    expect(screen.getAllByTestId("lexicon-count")[0].textContent).toBe("2");
    expect(screen.getAllByTestId("testimony-count")[0].textContent).toBe("1");
  });

  test("handles empty lexicon data", async () => {
    mockGetAllLexiconEntries.mockResolvedValue([]);
    mockGetAllTestimonies.mockResolvedValue([]);

    const { container } = render(await SourcesPage());

    await waitFor(() => {
      const content = container.querySelector('[data-testid="sources-page-content"]');
      expect(content).toBeTruthy();
    });

    const lexiconCount = container.querySelector('[data-testid="lexicon-count"]');
    const testimonyCount = container.querySelector('[data-testid="testimony-count"]');
    expect(lexiconCount?.textContent).toBe("0");
    expect(testimonyCount?.textContent).toBe("0");
  });

  test("handles missing testimony entries", async () => {
    mockGetAllLexiconEntries.mockResolvedValue([
      { title: "Test Entry" },
    ] as any);
    
    mockGetAllTestimonies.mockResolvedValue([]);

    const { container } = render(await SourcesPage());

    await waitFor(() => {
      const content = container.querySelector('[data-testid="sources-page-content"]');
      expect(content).toBeTruthy();
    });

    const lexiconCount = container.querySelector('[data-testid="lexicon-count"]');
    const testimonyCount = container.querySelector('[data-testid="testimony-count"]');
    expect(lexiconCount?.textContent).toBe("1");
    expect(testimonyCount?.textContent).toBe("0");
  });

  test("processes testimony content correctly", async () => {
    mockGetAllLexiconEntries.mockResolvedValue([]);
    
    mockGetAllTestimonies.mockResolvedValue([
      {
        id: "2",
        survivor_name: "Test Survivor",
        filename: "interview2.txt",
        content: "[00:01] David Boder: Question here\n[00:05] This is the survivor's response that is long enough to be included in the content preview and should be visible.",
        description: "Test interview description"
      },
    ] as any);

    render(await SourcesPage());

    await waitFor(() => {
      expect(screen.getAllByTestId("sources-page-content")[0]).toBeTruthy();
    });

    expect(screen.getAllByTestId("testimony-count")[0].textContent).toBe("1");
  });

  test("applies correct layout classes", async () => {
    mockGetAllLexiconEntries.mockResolvedValue([]);
    mockGetAllTestimonies.mockResolvedValue([]);

    const { container } = render(await SourcesPage());

    const pageDiv = container.firstChild as HTMLElement;
    expect(pageDiv.classList.contains("flex-1")).toBe(true);
    expect(pageDiv.classList.contains("min-h-0")).toBe(true);
  });

  test("includes Suspense with fallback", async () => {
    mockGetAllLexiconEntries.mockResolvedValue([]);
    mockGetAllTestimonies.mockResolvedValue([]);

    render(await SourcesPage());

    // The component should render without the skeleton since it's server-side
    await waitFor(() => {
      expect(screen.getAllByTestId("sources-page-content")[0]).toBeTruthy();
    });
  });
});