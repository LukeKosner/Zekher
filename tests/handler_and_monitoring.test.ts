import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  parseHttpsTargetUrl,
  parseHttpsTargetUrlFromRequest,
} from "../app/handler/url-safety";
import { buildCorsHeaders, withCorsHeaders } from "../app/handler/cors";
import {
  StreamErrorDetector,
  createStreamingError,
} from "../lib/monitoring/stream-error-detection";

describe("url-safety", () => {
  const originalAllowedHosts = process.env.PROXY_ALLOWED_HOSTS;

  beforeEach(() => {
    delete process.env.PROXY_ALLOWED_HOSTS;
  });

  afterEach(() => {
    if (originalAllowedHosts === undefined) {
      delete process.env.PROXY_ALLOWED_HOSTS;
      return;
    }
    process.env.PROXY_ALLOWED_HOSTS = originalAllowedHosts;
  });

  it("accepts valid https URL when no allowlist exists", () => {
    const parsed = parseHttpsTargetUrl("https://example.com/path?q=1");
    expect(parsed?.hostname).toBe("example.com");
    expect(parsed?.pathname).toBe("/path");
  });

  it("rejects empty, malformed, and non-https URLs", () => {
    expect(parseHttpsTargetUrl(null)).toBeNull();
    expect(parseHttpsTargetUrl("not-a-url")).toBeNull();
    expect(parseHttpsTargetUrl("http://example.com")).toBeNull();
  });

  it("blocks localhost/internal/private IPv4/private IPv6 URLs", () => {
    expect(parseHttpsTargetUrl("https://localhost")).toBeNull();
    expect(parseHttpsTargetUrl("https://api.local")).toBeNull();
    expect(parseHttpsTargetUrl("https://service.internal")).toBeNull();
    expect(parseHttpsTargetUrl("https://10.0.0.1")).toBeNull();
    expect(parseHttpsTargetUrl("https://172.16.0.3")).toBeNull();
    expect(parseHttpsTargetUrl("https://192.168.1.9")).toBeNull();
    expect(parseHttpsTargetUrl("https://169.254.1.2")).toBeNull();
    expect(parseHttpsTargetUrl("https://127.0.0.1")).toBeNull();
    expect(parseHttpsTargetUrl("https://[::1]")).toBeNull();
    expect(parseHttpsTargetUrl("https://[fc00::1]")).toBeNull();
    expect(parseHttpsTargetUrl("https://[fd00::abcd]")).toBeNull();
    expect(parseHttpsTargetUrl("https://[fe80::1]")).toBeNull();
  });

  it("allows public IP hosts", () => {
    const parsed = parseHttpsTargetUrl("https://8.8.8.8");
    expect(parsed?.hostname).toBe("8.8.8.8");
  });

  it("enforces explicit host allowlist and wildcard patterns", () => {
    process.env.PROXY_ALLOWED_HOSTS = "allowed.com, *.trusted.org";

    expect(parseHttpsTargetUrl("https://allowed.com")?.hostname).toBe(
      "allowed.com"
    );
    expect(parseHttpsTargetUrl("https://trusted.org")?.hostname).toBe(
      "trusted.org"
    );
    expect(parseHttpsTargetUrl("https://api.trusted.org")?.hostname).toBe(
      "api.trusted.org"
    );
    expect(parseHttpsTargetUrl("https://example.com")).toBeNull();
  });

  it("reads target URL from request query params", () => {
    process.env.PROXY_ALLOWED_HOSTS = "example.com";
    const request = new Request(
      "https://proxy.test/?url=https%3A%2F%2Fexample.com%2Fhello"
    );

    const parsed = parseHttpsTargetUrlFromRequest(request);
    expect(parsed?.toString()).toBe("https://example.com/hello");
  });

  it("supports custom query param name", () => {
    process.env.PROXY_ALLOWED_HOSTS = "example.com";
    const request = new Request(
      "https://proxy.test/?target=https%3A%2F%2Fexample.com%2Fcustom"
    );

    const parsed = parseHttpsTargetUrlFromRequest(request, "target");
    expect(parsed?.toString()).toBe("https://example.com/custom");
  });

  it("returns null when request query param is missing", () => {
    const request = new Request("https://proxy.test/");
    expect(parseHttpsTargetUrlFromRequest(request)).toBeNull();
  });

  it("allows public IPv6 hosts", () => {
    const parsed = parseHttpsTargetUrl("https://[2606:4700:4700::1111]");
    expect(parsed?.hostname).toBe("[2606:4700:4700::1111]");
  });
});

describe("cors helpers", () => {
  it("buildCorsHeaders uses request origin and requested headers", () => {
    const request = new Request("https://app.test", {
      headers: {
        origin: "https://client.example",
        "access-control-request-headers": "x-custom, authorization",
      },
    });

    const headers = buildCorsHeaders(request);

    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "https://client.example"
    );
    expect(headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, POST, OPTIONS"
    );
    expect(headers.get("Access-Control-Allow-Headers")).toBe(
      "x-custom, authorization"
    );
    expect(headers.get("Access-Control-Max-Age")).toBe("86400");
    expect(headers.get("Vary")).toContain("Origin");
  });

  it("buildCorsHeaders falls back to defaults", () => {
    const request = new Request("https://app.test", {
      headers: {
        "access-control-request-headers": "  ",
      },
    });

    const headers = buildCorsHeaders(request);
    expect(headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(headers.get("Access-Control-Allow-Headers")).toContain(
      "content-type"
    );
    expect(headers.get("Access-Control-Allow-Headers")).toContain(
      "mcp-protocol-version"
    );
  });

  it("withCorsHeaders merges CORS values while preserving body/status", async () => {
    const request = new Request("https://app.test", {
      headers: { origin: "https://client.example" },
    });
    const response = new Response("payload", {
      status: 202,
      statusText: "Accepted",
      headers: {
        "x-original": "keep-me",
      },
    });

    const merged = withCorsHeaders(request, response);

    expect(merged.status).toBe(202);
    expect(merged.statusText).toBe("Accepted");
    expect(merged.headers.get("x-original")).toBe("keep-me");
    expect(merged.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://client.example"
    );
    expect(await merged.text()).toBe("payload");
  });
});

describe("stream error detection", () => {
  it("processes normal chunks and strips ctrl46 tokens", () => {
    const detector = new StreamErrorDetector();
    const result = detector.processChunk("hello<ctrl46>world");

    expect(result.hasError).toBe(false);
    expect(result.shouldStop).toBe(false);
    expect(result.processedText).toBe("helloworld");
    expect(detector.getStats().ctrl46Count).toBe(1);
  });

  it("flags repeated ctrl46 patterns and suggests stopping", () => {
    const detector = new StreamErrorDetector();
    detector.processChunk("<ctrl46>");
    detector.processChunk("<ctrl46>");
    const result = detector.processChunk("value<ctrl46>");

    expect(result.hasError).toBe(true);
    expect(result.errorType).toBe("REPEATED_CTRL46");
    expect(result.shouldStop).toBe(true);
    expect(result.processedText).toBe("value");
  });

  it("limits internal buffer growth and supports reset", () => {
    const detector = new StreamErrorDetector();
    const oversizedChunk = "a".repeat(1500);
    detector.processChunk(oversizedChunk);

    const beforeReset = detector.getStats();
    expect(beforeReset.bufferLength).toBe(1000);

    detector.reset();
    expect(detector.getStats()).toEqual({ ctrl46Count: 0, bufferLength: 0 });
  });

  it("creates typed streaming errors with known and fallback messages", () => {
    const knownError = createStreamingError("REPEATED_CTRL46");
    expect(knownError.name).toBe("StreamingError");
    expect(knownError.message).toContain("repeatedly streaming <ctrl46>");

    const unknownError = createStreamingError("UNEXPECTED");
    expect(unknownError.name).toBe("StreamingError");
    expect(unknownError.message).toBe("Unknown streaming error");
  });

  it("can clean text helper output directly for completeness", () => {
    const detector = new StreamErrorDetector();
    expect((detector as any).cleanText("a<ctrl46>b<ctrl46>c")).toBe("abc");
  });
});
