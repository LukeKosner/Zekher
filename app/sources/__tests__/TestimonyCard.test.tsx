import { test, describe, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { TestimonyCard } from "@/app/sources/components/TestimonyCard";
import { TestimonySource } from "@/app/sources/types";
import "@testing-library/jest-dom";

describe("TestimonyCard", () => {
  const mockSource: TestimonySource = {
    id: "1",
    filename: "test.txt",
    survivor_name: "Test Survivor",
    description: "Test Description"
  };

  test("renders the card with the correct name and description", () => {
    render(<TestimonyCard source={mockSource} />);
    expect(screen.getByText("Test Survivor")).toBeTruthy();
    expect(
      screen.getByText("from the David P. Boder interviews")
    ).toBeTruthy();
    expect(screen.getByText("Test Description")).toBeTruthy();
  });

  test("renders the read full testimony button", () => {
    render(<TestimonyCard source={mockSource} />);
    const readButtons = screen.getAllByText(/read full testimony/i);
    expect(readButtons.length).toBeGreaterThan(0);
    expect(readButtons[0]).toBeTruthy();
  });
});
