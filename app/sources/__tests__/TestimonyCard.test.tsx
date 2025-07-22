import { test, describe, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { TestimonyCard } from "@/app/sources/components/TestimonyCard";
import { TestimonySource } from "@/app/sources/types";
import "@testing-library/jest-dom";

describe("TestimonyCard", () => {
  const mockSource: TestimonySource = {
    id: "1",
    filename: "test.txt",
    content: "Test content",
    survivor_name: "Test Survivor",
    testimony_language: "English",
    interviewer: "David P. Boder",
    date: "1946-08-15",
    location: "Chicago, Illinois",
    url: "https://example.com/testimony",
    mediaFile: "test.mp3",
    transcriptionFile: "test.txt",
    mediaUrl: "https://example.com/test.mp3",
    transcriptUrl: "https://example.com/test.txt",
    description: "Test Description",
    exportDate: "2023-01-01",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Test Survivor",
    tags: [],
    featured: false,
    survivorName: "Test Survivor",
    excerpt: "Test excerpt from testimony",
    citation: "Test Citation"
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
