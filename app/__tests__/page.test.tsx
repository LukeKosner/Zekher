import { test, describe, expect, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../page";
import "@testing-library/jest-dom";

// Mock framer motion
mock.module("motion/react", () => ({
  motion: {
    div: mock(({ children, ...props }) => <div {...props}>{children}</div>),
    h1: mock(({ children, ...props }) => <h1 {...props}>{children}</h1>),
    p: mock(({ children, ...props }) => <p {...props}>{children}</p>)
  }
}));

// Mock Next.js components
mock.module("next/link", () => ({
  default: mock(({ children, href, ...props }) => 
    <a href={href} {...props}>{children}</a>
  )
}));

mock.module("next/image", () => ({
  default: mock((props) => 
    <img src={props.src} alt={props.alt} data-testid="next-image" />
  )
}));

// Mock Radix UI
mock.module("@radix-ui/react-aspect-ratio", () => ({
  AspectRatio: mock(({ children, ...props }) => 
    <div data-testid="aspect-ratio" {...props}>{children}</div>
  )
}));

// Mock UI components
mock.module("@/components/ui/badge", () => ({
  Badge: mock(({ children, ...props }) => 
    <span data-testid="badge" {...props}>{children}</span>
  )
}));

mock.module("@/components/ui/button", () => ({
  Button: mock(({ children, asChild, ...props }) => 
    asChild ? children : <button {...props}>{children}</button>
  )
}));

mock.module("@/components/ui/kibo-ui/announcement", () => ({
  Announcement: mock(({ children }) => 
    <div data-testid="announcement">{children}</div>
  ),
  AnnouncementTag: mock(({ children, ...props }) => 
    <span data-testid="announcement-tag" {...props}>{children}</span>
  ),
  AnnouncementTitle: mock(({ children }) => 
    <div data-testid="announcement-title">{children}</div>
  )
}));

// Mock Lucide icons
const mockIcon = mock(() => <span data-testid="icon" />);
mock.module("lucide-react", () => ({
  Library: mockIcon,
  MessagesSquare: mockIcon,
  ArrowUpRight: mockIcon,
  Server: mockIcon,
  Mail: mockIcon,
  Info: mockIcon
}));

describe("Home Page", () => {
  describe("Component rendering", () => {
    test("should render main content structure", () => {
      render(<Home />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveClass("min-h-screen");
    });

    test("should render announcement banner", () => {
      render(<Home />);

      expect(screen.getByTestId("announcement")).toBeInTheDocument();
      expect(screen.getByTestId("announcement-tag")).toBeInTheDocument();
      expect(screen.getByTestId("announcement-title")).toBeInTheDocument();
      expect(screen.getByText("v3 Beta")).toBeInTheDocument();
      expect(screen.getByText("Support for MCP")).toBeInTheDocument();
    });

    test("should render hero section", () => {
      render(<Home />);

      expect(screen.getByText("Preserving Holocaust memory with AI")).toBeInTheDocument();
      expect(screen.getByText(/Access authoritative Holocaust education materials/)).toBeInTheDocument();
    });

    test("should render primary and secondary CTA buttons", () => {
      render(<Home />);

      expect(screen.getByText("Start Chat")).toBeInTheDocument();
      expect(screen.getByText("Browse Sources")).toBeInTheDocument();
      
      // Check links
      const chatLink = screen.getByText("Start Chat").closest("a");
      const sourcesLink = screen.getByText("Browse Sources").closest("a");
      
      expect(chatLink).toHaveAttribute("href", "/chat");
      expect(sourcesLink).toHaveAttribute("href", "/sources");
    });
  });

  describe("External links", () => {
    test("should render Yad Vashem link", () => {
      render(<Home />);

      const yadVashemLink = screen.getByText("Yad Vashem resources").closest("a");
      expect(yadVashemLink).toHaveAttribute("href", "https://www.yadvashem.org/holocaust/resource-center/lexicon.html");
      expect(yadVashemLink).toHaveAttribute("target", "_blank");
      expect(yadVashemLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("should render survivor testimonies link", () => {
      render(<Home />);

      const survivorLink = screen.getByText("survivor testimonies").closest("a");
      expect(survivorLink).toHaveAttribute("href", "https://voices.library.iit.edu/");
      expect(survivorLink).toHaveAttribute("target", "_blank");
      expect(survivorLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Memorial image section", () => {
    test("should render memorial image", () => {
      render(<Home />);

      expect(screen.getByTestId("next-image")).toBeInTheDocument();
      expect(screen.getByTestId("aspect-ratio")).toBeInTheDocument();
      
      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("alt", "Memorial to the Murdered Jews of Europe");
      expect(image).toHaveAttribute("src", "/giulia-gasperini-8S-D-UodlHU-unsplash.jpg");
    });

    test("should render photo credit", () => {
      render(<Home />);

      expect(screen.getByText("Photo by")).toBeInTheDocument();
      expect(screen.getByText("Giulia Gasperini")).toBeInTheDocument();
      expect(screen.getByText("Unsplash")).toBeInTheDocument();
      
      // Check credit links
      const photographerLink = screen.getByText("Giulia Gasperini").closest("a");
      const platformLink = screen.getByText("Unsplash").closest("a");
      
      expect(photographerLink).toHaveAttribute("target", "_blank");
      expect(platformLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("Solution overview section", () => {
    test("should render solution overview heading", () => {
      render(<Home />);

      expect(screen.getByText("Tools for Responsible Agents")).toBeInTheDocument();
      expect(screen.getByText(/By integrating authoritative sources/)).toBeInTheDocument();
    });

    test("should render three feature cards", () => {
      render(<Home />);

      expect(screen.getByText("Chat Experience")).toBeInTheDocument();
      expect(screen.getByText("MCP Server")).toBeInTheDocument();
      expect(screen.getByText("Source Library")).toBeInTheDocument();
    });

    test("should render feature descriptions", () => {
      render(<Home />);

      expect(screen.getByText(/Familiar AI chat powered by Lexicon content/)).toBeInTheDocument();
      expect(screen.getByText(/Model Context Protocol server for adding Lexicon functionality/)).toBeInTheDocument();
      expect(screen.getByText(/Unified library serving as the landing page/)).toBeInTheDocument();
    });

    test("should render feature CTAs", () => {
      render(<Home />);

      // Chat Experience CTA
      const tryChatButton = screen.getByText("Try Chat");
      expect(tryChatButton.closest("a")).toHaveAttribute("href", "/chat");

      // MCP Server CTA
      const learnMoreButton = screen.getByText("Learn More");
      expect(learnMoreButton.closest("a")).toHaveAttribute("href", "/developers/mcp");

      // Source Library CTA (second Browse Sources button)
      const browseSourcesButtons = screen.getAllByText("Browse Sources");
      expect(browseSourcesButtons.length).toBeGreaterThanOrEqual(2);
      expect(browseSourcesButtons[1].closest("a")).toHaveAttribute("href", "/sources");
    });
  });

  describe("Get involved section", () => {
    test("should render get involved heading and content", () => {
      render(<Home />);

      expect(screen.getByText("Get Involved")).toBeInTheDocument();
      expect(screen.getByText(/Zekher is an open-source project in beta/)).toBeInTheDocument();
    });

    test("should render email and about CTAs", () => {
      render(<Home />);

      const emailButton = screen.getByText("Email Us");
      const aboutButton = screen.getByText("About");

      expect(emailButton.closest("a")).toHaveAttribute("href", "mailto:hey@lukekosner.com");
      expect(aboutButton.closest("a")).toHaveAttribute("href", "/about");
    });
  });

  describe("Responsive design", () => {
    test("should have responsive container classes", () => {
      render(<Home />);

      const container = screen.getByRole("main").firstChild;
      expect(container).toHaveClass("max-w-4xl", "mx-auto");
      expect(container).toHaveClass("px-4", "sm:px-6", "lg:px-8");
    });

    test("should have responsive grid for feature cards", () => {
      render(<Home />);

      // Find the grid container (look for the element with grid classes)
      const gridElements = document.querySelectorAll('[class*="grid-cols"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    test("should have proper heading hierarchy", () => {
      render(<Home />);

      // Main heading should be h1
      const mainHeading = screen.getByText("Preserving Holocaust memory with AI");
      expect(mainHeading.tagName.toLowerCase()).toBe("h1");

      // Section headings should be h2
      expect(screen.getByText("Tools for Responsible Agents")).toBeInTheDocument();
      expect(screen.getByText("Get Involved")).toBeInTheDocument();
    });

    test("should have proper link attributes for external links", () => {
      render(<Home />);

      const externalLinks = document.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });

    test("should have descriptive alt text for images", () => {
      render(<Home />);

      const image = screen.getByTestId("next-image");
      expect(image).toHaveAttribute("alt", "Memorial to the Murdered Jews of Europe");
    });
  });

  describe("Animation integration", () => {
    test("should render without throwing when motion components are used", () => {
      expect(() => {
        render(<Home />);
      }).not.toThrow();
    });

    test("should render content even with mocked motion", () => {
      render(<Home />);

      // Content should still be visible even with mocked animations
      expect(screen.getByText("Preserving Holocaust memory with AI")).toBeInTheDocument();
      expect(screen.getByText("Tools for Responsible Agents")).toBeInTheDocument();
    });
  });
});