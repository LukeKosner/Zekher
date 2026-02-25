import { buildCorsHeaders, withCorsHeaders } from "../cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export async function GET(request: Request): Promise<Response> {
  return withCorsHeaders(
    request,
    new Response(
      "This endpoint is deprecated. PDF previews now render in the MCP app via client-side PDF.js and app-only byte-range tools.",
      {
        status: 410,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    )
  );
}
