import { test, describe, expect, mock, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import GlobalError from "../global-error";
import "@testing-library/jest-dom";

// Mock Sentry
const mockCaptureException = mock();

mock.module("@sentry/nextjs", () => ({
  captureException: mockCaptureException
}));

// Mock Next.js error component
mock.module("next/error", () => ({
  default: mock(({ statusCode }) => 
    <div data-testid="next-error">Error {statusCode}</div>
  )
}));

// Mock React hooks
const mockUseEffect = mock();
mock.module("react", () => ({
  useEffect: mockUseEffect
}));

describe("GlobalError", () => {
  const mockError: Error & { digest?: string } = {
    name: "TestError",
    message: "Test error message",
    digest: "test-digest"
  };

  beforeEach(() => {
    mockCaptureException.mockClear();
    mockUseEffect.mockClear();
    
    // Mock useEffect to call the callback immediately
    mockUseEffect.mockImplementation((callback: () => void, deps: any[]) => {
      if (deps && deps.includes(mockError)) {
        callback();
      }
    });
  });

  describe("Component rendering", () => {
    test("should render basic HTML structure", () => {
      render(<GlobalError error={mockError} />);

      // Should render html and body tags
      expect(document.querySelector("html")).toBeInTheDocument();
      expect(document.querySelector("body")).toBeInTheDocument();
    });

    test("should render NextError component", () => {
      render(<GlobalError error={mockError} />);

      expect(screen.getByTestId("next-error")).toBeInTheDocument();
      expect(screen.getByText("Error 0")).toBeInTheDocument();
    });

    test("should pass statusCode 0 to NextError", () => {
      render(<GlobalError error={mockError} />);

      // NextError should receive statusCode 0 as documented
      expect(screen.getByText("Error 0")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    test("should capture exception with Sentry on mount", () => {
      render(<GlobalError error={mockError} />);

      expect(mockCaptureException).toHaveBeenCalledWith(mockError);
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    test("should handle error with digest", () => {
      const errorWithDigest = {
        name: "TestError",
        message: "Test error with digest",
        digest: "abc123"
      };

      render(<GlobalError error={errorWithDigest} />);

      expect(mockCaptureException).toHaveBeenCalledWith(errorWithDigest);
    });

    test("should handle error without digest", () => {
      const errorWithoutDigest = {
        name: "TestError",
        message: "Test error without digest"
      };

      render(<GlobalError error={errorWithoutDigest} />);

      expect(mockCaptureException).toHaveBeenCalledWith(errorWithoutDigest);
    });

    test("should call useEffect with error dependency", () => {
      render(<GlobalError error={mockError} />);

      expect(mockUseEffect).toHaveBeenCalledWith(
        expect.any(Function),
        [mockError]
      );
    });
  });

  describe("Error object variations", () => {
    test("should handle standard Error object", () => {
      const standardError = new Error("Standard error");
      
      render(<GlobalError error={standardError} />);

      expect(mockCaptureException).toHaveBeenCalledWith(standardError);
    });

    test("should handle Error with additional properties", () => {
      const customError = Object.assign(new Error("Custom error"), {
        digest: "custom-digest",
        stack: "custom stack trace"
      });

      render(<GlobalError error={customError} />);

      expect(mockCaptureException).toHaveBeenCalledWith(customError);
    });

    test("should handle different error types", () => {
      const typeError = new TypeError("Type error");
      const extendedError = Object.assign(typeError, { digest: "type-digest" });

      render(<GlobalError error={extendedError} />);

      expect(mockCaptureException).toHaveBeenCalledWith(extendedError);
    });
  });

  describe("Integration requirements", () => {
    test("should be a client component", () => {
      // This is tested by the "use client" directive at the top of the file
      // We can verify it renders without SSR issues
      expect(() => {
        render(<GlobalError error={mockError} />);
      }).not.toThrow();
    });

    test("should provide fallback UI when error occurs", () => {
      render(<GlobalError error={mockError} />);

      // Should show some UI even in error state
      expect(screen.getByTestId("next-error")).toBeInTheDocument();
    });

    test("should not expose sensitive error information", () => {
      const sensitiveError = Object.assign(new Error("Database connection failed"), {
        digest: "sensitive-digest",
        connectionString: "postgresql://user:pass@localhost/db"
      });

      render(<GlobalError error={sensitiveError} />);

      // Should not display sensitive information in UI
      expect(screen.queryByText("postgresql://")).not.toBeInTheDocument();
      expect(screen.queryByText("Database connection failed")).not.toBeInTheDocument();
    });
  });

  describe("Sentry integration", () => {
    test("should only capture exception once per error", () => {
      const { rerender } = render(<GlobalError error={mockError} />);
      
      // Re-render with same error
      rerender(<GlobalError error={mockError} />);

      // Should only capture once due to useEffect dependency
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    test("should capture new exception when error changes", () => {
      const firstError = new Error("First error");
      const secondError = new Error("Second error");

      const { rerender } = render(<GlobalError error={firstError} />);
      
      // Clear and set up for second error
      mockCaptureException.mockClear();
      mockUseEffect.mockImplementation((callback: () => void, deps: any[]) => {
        if (deps && deps.includes(secondError)) {
          callback();
        }
      });

      rerender(<GlobalError error={secondError} />);

      expect(mockCaptureException).toHaveBeenCalledWith(secondError);
    });
  });
});