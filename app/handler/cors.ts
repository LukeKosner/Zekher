const DEFAULT_ALLOWED_HEADERS =
  "authorization, content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id, x-requested-with";

export function buildCorsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  const requestedHeaders = request.headers.get("access-control-request-headers");

  headers.set("Access-Control-Allow-Origin", origin ?? "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    requestedHeaders && requestedHeaders.trim()
      ? requestedHeaders
      : DEFAULT_ALLOWED_HEADERS
  );
  headers.set("Access-Control-Max-Age", "86400");
  headers.set(
    "Vary",
    "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  return headers;
}

export function withCorsHeaders(request: Request, response: Response): Response {
  const corsHeaders = buildCorsHeaders(request);
  const headers = new Headers(response.headers);

  corsHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
