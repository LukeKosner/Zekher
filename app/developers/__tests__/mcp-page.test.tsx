import { test, expect, describe, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import DevelopersPage from "../mcp/page";

// Mock framer-motion
const mockMotionDiv = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

// Mock Next.js Link
const mockLink = ({ children, href, ...props }: any) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// Mock lucide-react icons
const ArrowUpRight = () => <span data-testid="arrow-up-right" />;
const Code = () => <span data-testid="code" />;
const Terminal = () => <span data-testid="terminal" />;

// Mock modules
mock.module("framer-motion", () => ({
  motion: { div: mockMotionDiv },
  Variants: {}
}));

mock.module("next/link", () => ({
  default: mockLink
}));

mock.module("lucide-react", () => ({
  ArrowUpRight,
  Code,
  Terminal
}));

// Set environment variable for tests
Object.defineProperty(process.env, "NEXT_PUBLIC_BASE_URL", {
  value: "https://test.example.com",
  writable: true
});

describe("Developers MCP Page", () => {
  test("should render main sections", () => {
    render(<DevelopersPage />);

    expect(screen.getByText("Zekher's MCP Server")).toBeInTheDocument();
    expect(screen.getByText("Claude Setup")).toBeInTheDocument();
    expect(screen.getByText("Other Clients")).toBeInTheDocument();
    expect(screen.getByText("Available Capabilities")).toBeInTheDocument();
    expect(screen.getByText("Developer Interest")).toBeInTheDocument();
  });

  test("should display server configuration with environment URL", () => {
    render(<DevelopersPage />);

    expect(
      screen.getAllByText("https://test.example.com/sse")[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("https://test.example.com/mcp")[0]
    ).toBeInTheDocument();
  });

  test("should display MCP capabilities", () => {
    render(<DevelopersPage />);

    expect(
      screen.getAllByText("yad_vashem_holocaust_lexicon")[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("holocaust_education_context")[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Returns up to 6 sources/)[0]
    ).toBeInTheDocument();
  });

  test("should have contact email link", () => {
    render(<DevelopersPage />);

    const emailLinks = screen
      .getAllByRole("link")
      .filter(
        (link) => link.getAttribute("href") === "mailto:hey@lukekosner.com"
      );
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  test("should have configuration steps", () => {
    render(<DevelopersPage />);

    expect(screen.getAllByText("Configuration Steps")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Add custom connector/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Enter the server URL/)[0]).toBeInTheDocument();
  });
});
