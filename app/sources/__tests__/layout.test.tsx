import { render, screen } from "@testing-library/react";
import SourcesLayout, { metadata } from "@/app/sources/layout";
import "@testing-library/jest-dom";

describe("SourcesLayout", () => {
  it("renders children correctly", () => {
    const testContent = <div>Test Content</div>;
    render(<SourcesLayout>{testContent}</SourcesLayout>);
    
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies the correct CSS classes for layout structure", () => {
    const { container } = render(
      <SourcesLayout>
        <div>Child Component</div>
      </SourcesLayout>
    );
    
    const layoutDiv = container.firstChild;
    expect(layoutDiv).toHaveClass(
      "relative",
      "flex",
      "h-full",
      "w-full",
      "flex-col",
      "divide-y",
      "min-h-0"
    );
  });

  it("renders multiple children in the layout", () => {
    render(
      <SourcesLayout>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </SourcesLayout>
    );
    
    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
    expect(screen.getByText("Third Child")).toBeInTheDocument();
  });
});

describe("metadata", () => {
  it("has correct title", () => {
    expect(metadata.title).toBe("Sources - Zekher");
  });

  it("has appropriate description", () => {
    expect(metadata.description).toBe(
      "Browse Holocaust historical sources and survivor testimonies from the Yad Vashem archives"
    );
  });

  it("has Open Graph metadata", () => {
    expect(metadata.openGraph).toEqual({
      title: "Sources - Zekher",
      description: "Browse Holocaust historical sources and survivor testimonies from the Yad Vashem archives"
    });
  });

  it("has consistent Open Graph and regular metadata", () => {
    expect(metadata.openGraph?.title).toBe(metadata.title);
    expect(metadata.openGraph?.description).toBe(metadata.description);
  });
});