import { buildCorsHeaders, withCorsHeaders } from "../cors";
import { parseHttpsTargetUrlFromRequest } from "../url-safety";

function badRequest(request: Request, message: string): Response {
  return withCorsHeaders(
    request,
    new Response(message, {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  );
}

function copyHeaderIfPresent(from: Headers, to: Headers, key: string) {
  const value = from.get(key);
  if (value) to.set(key, value);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export async function GET(request: Request): Promise<Response> {
  const target = parseHttpsTargetUrlFromRequest(request);
  if (!target) {
    return badRequest(request, "Invalid or disallowed url parameter.");
  }

  let upstream: Response;
  try {
    const rangeHeader = request.headers.get("range");
    upstream = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "application/pdf,text/plain;q=0.9,*/*;q=0.8",
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });
  } catch {
    return withCorsHeaders(
      request,
      new Response("Failed to fetch upstream asset.", {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    );
  }

  if (!upstream.ok || !upstream.body) {
    return withCorsHeaders(
      request,
      new Response(`Upstream fetch failed (${upstream.status}).`, {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    );
  }

  const headers = new Headers();
  copyHeaderIfPresent(upstream.headers, headers, "content-type");
  copyHeaderIfPresent(upstream.headers, headers, "content-length");
  copyHeaderIfPresent(upstream.headers, headers, "accept-ranges");
  copyHeaderIfPresent(upstream.headers, headers, "content-range");
  copyHeaderIfPresent(upstream.headers, headers, "etag");
  copyHeaderIfPresent(upstream.headers, headers, "last-modified");
  copyHeaderIfPresent(upstream.headers, headers, "content-disposition");
  headers.set("Cache-Control", "public, max-age=3600");
  headers.set("X-Content-Type-Options", "nosniff");

  return withCorsHeaders(
    request,
    new Response(upstream.body, {
      status: upstream.status,
      headers,
    })
  );
}
