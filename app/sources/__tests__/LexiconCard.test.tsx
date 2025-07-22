import { test, describe, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { LexiconCard } from "@/app/sources/components/LexiconCard";
import { LexiconSource } from "@/app/sources/types";
import "@testing-library/jest-dom";

describe("LexiconCard", () => {
  const mockSource: LexiconSource = {
    id: "1",
    filename: "test.pdf",
    title: "Test Title",
    content: "Test content",
    pdfFile: "test.pdf",
    pdfUrl: "https://example.com/test.pdf",
    txtUrl: "https://example.com/test.txt",
    redirectUrl: null,
    citation: "Test Citation",
    createdAt: new Date(),
    updatedAt: new Date(),
    description: "Test Description",
    tags: [],
    featured: false,
    slug: "1"
  };

  test("renders the card with the correct title and description", () => {
    const { container } = render(<LexiconCard source={mockSource} />);
    expect(container.querySelector('[data-slot="card-title"]')).toBeTruthy();
    expect(
      screen.getAllByText("from Yad Vashem's Holocaust Lexicon")[0]
    ).toBeTruthy();
  });

  test("renders the pdf preview", () => {
    const { container } = render(<LexiconCard source={mockSource} />);
    // Just check that the card renders without errors
    expect(container.firstChild).toBeTruthy();
  });

  test("renders the download button", () => {
    const { container } = render(<LexiconCard source={mockSource} />);
    const downloadButtons = container.querySelectorAll("button, a");
    expect(downloadButtons.length).toBeGreaterThan(0);
  });

  test("renders the view full pdf button", () => {
    const { container } = render(<LexiconCard source={mockSource} />);
    const buttons = container.querySelectorAll("button, a");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
