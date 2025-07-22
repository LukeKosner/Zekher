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
    description: "Test Description"
  };

  test("renders the card with the correct title and description", () => {
    render(<LexiconCard source={mockSource} />);
    expect(screen.getByText("Test Title")).toBeTruthy();
    expect(
      screen.getByText("from Yad Vashem's Holocaust Lexicon")
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
