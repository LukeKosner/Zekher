import { createHash } from "node:crypto";
import { createCanvas } from "@napi-rs/canvas";
import { buildCorsHeaders, withCorsHeaders } from "../cors";
import { parseHttpsTargetUrlFromRequest } from "../url-safety";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 40 * 1024 * 1024;
const MAX_CACHE_ENTRIES = 120;
const CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_PREVIEW_WIDTH = 680;
const MIN_PREVIEW_WIDTH = 240;
const MAX_PREVIEW_WIDTH = 1400;

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

type CacheEntry = {
  body: Uint8Array;
  etag: string;
  expiresAt: number;
};

const previewCache = new Map<string, CacheEntry>();
let pdfJsPromise: Promise<PdfJsModule> | null = null;

function getPreviewWidth(request: Request): number {
  const requestUrl = new URL(request.url);
  const rawWidth = requestUrl.searchParams.get("w");
  const parsed = Number.parseInt(rawWidth ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_PREVIEW_WIDTH;
  return Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, parsed));
}

function getPageNumber(request: Request): number {
  const requestUrl = new URL(request.url);
  const rawPage = requestUrl.searchParams.get("page");
  const parsed = Number.parseInt(rawPage ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function cacheKey(target: URL, page: number, width: number): string {
  return `${target.toString()}::p=${page}::w=${width}`;
}

function setCacheEntry(key: string, entry: CacheEntry): void {
  previewCache.set(key, entry);
  if (previewCache.size <= MAX_CACHE_ENTRIES) return;

  const firstKey = previewCache.keys().next().value;
  if (firstKey) {
    previewCache.delete(firstKey);
  }
}

function getCacheEntry(key: string): CacheEntry | undefined {
  const cached = previewCache.get(key);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    previewCache.delete(key);
    return undefined;
  }
  return cached;
}

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

function respondImage(
  request: Request,
  body: Uint8Array,
  etag: string
): Response {
  if (request.headers.get("if-none-match") === etag) {
    return withCorsHeaders(
      request,
      new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=600",
          "X-Content-Type-Options": "nosniff",
        },
      })
    );
  }

  return withCorsHeaders(
    request,
    new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=600",
        ETag: etag,
        "X-Content-Type-Options": "nosniff",
      },
    })
  );
}

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfJsPromise;
}

async function fetchPdfBytes(target: URL): Promise<Uint8Array> {
  const upstream = await fetch(target.toString(), {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "application/pdf,*/*;q=0.8",
    },
  });

  if (!upstream.ok) {
    throw new Error(`Upstream fetch failed (${upstream.status}).`);
  }

  const contentLengthRaw = upstream.headers.get("content-length");
  if (contentLengthRaw) {
    const contentLength = Number.parseInt(contentLengthRaw, 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_PDF_BYTES) {
      throw new Error("PDF exceeds maximum allowed size.");
    }
  }

  const arrayBuffer = await upstream.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
    throw new Error("PDF exceeds maximum allowed size.");
  }

  return new Uint8Array(arrayBuffer);
}

async function renderPdfPreviewImage(
  bytes: Uint8Array,
  pageNumber: number,
  width: number
): Promise<Uint8Array> {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdf = await loadingTask.promise;
  try {
    if (pageNumber > pdf.numPages) {
      throw new Error("Requested page does not exist.");
    }

    const page = await pdf.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = width / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(
      Math.max(1, Math.floor(viewport.width)),
      Math.max(1, Math.floor(viewport.height))
    );
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      canvas: canvas as unknown as HTMLCanvasElement,
      viewport,
    }).promise;

    const buffer = canvas.toBuffer("image/png");
    return new Uint8Array(buffer);
  } finally {
    await pdf.destroy();
  }
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

  const width = getPreviewWidth(request);
  const page = getPageNumber(request);
  const key = cacheKey(target, page, width);
  const cached = getCacheEntry(key);
  if (cached) {
    return respondImage(request, cached.body, cached.etag);
  }

  try {
    const bytes = await fetchPdfBytes(target);
    const image = await renderPdfPreviewImage(bytes, page, width);
    const etag = `"${createHash("sha256").update(image).digest("hex")}"`;

    setCacheEntry(key, {
      body: image,
      etag,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return respondImage(request, image, etag);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render preview.";
    const status = message.includes("Requested page does not exist.") ? 404 : 502;

    return withCorsHeaders(
      request,
      new Response(message, {
        status,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    );
  }
}
