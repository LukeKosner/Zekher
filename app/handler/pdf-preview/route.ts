import { createHash } from "node:crypto";
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
type CanvasModule = {
  createCanvas: (
    width: number,
    height: number
  ) => {
    getContext: (type: "2d") => unknown;
    toBuffer: (mimeType: "image/png") => Uint8Array | Buffer;
  };
  DOMMatrix?: unknown;
  ImageData?: unknown;
  Path2D?: unknown;
};

type CacheEntry = {
  body: Uint8Array;
  etag: string;
  contentType: "image/png" | "image/svg+xml";
  expiresAt: number;
};

const previewCache = new Map<string, CacheEntry>();
let pdfJsPromise: Promise<PdfJsModule> | null = null;
let canvasModulePromise: Promise<CanvasModule> | null = null;

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

function installCanvasGlobals(canvasModule: CanvasModule): void {
  const globalScope = globalThis as Record<string, unknown>;
  if (!globalScope.DOMMatrix && canvasModule.DOMMatrix) {
    globalScope.DOMMatrix = canvasModule.DOMMatrix;
  }
  if (!globalScope.ImageData && canvasModule.ImageData) {
    globalScope.ImageData = canvasModule.ImageData;
  }
  if (!globalScope.Path2D && canvasModule.Path2D) {
    globalScope.Path2D = canvasModule.Path2D;
  }
}

async function loadCanvasModule(): Promise<CanvasModule> {
  if (!canvasModulePromise) {
    canvasModulePromise = (async () => {
      let loadedModule: CanvasModule | undefined;
      let lastError: unknown;

      const maybeRequire = globalThis as { require?: NodeJS.Require };
      if (typeof maybeRequire.require === "function") {
        try {
          loadedModule = maybeRequire.require("@napi-rs/canvas") as CanvasModule;
        } catch (error) {
          lastError = error;
        }
      }

      if (!loadedModule) {
        try {
          loadedModule = (await import("@napi-rs/canvas")) as CanvasModule;
        } catch (error) {
          lastError = error;
        }
      }

      if (!loadedModule || typeof loadedModule.createCanvas !== "function") {
        const detail = normalizeErrorMessage(lastError);
        throw new Error(`Server canvas renderer unavailable: ${detail}`);
      }

      installCanvasGlobals(loadedModule);
      return loadedModule;
    })().catch((error) => {
      canvasModulePromise = null;
      throw error;
    });
  }

  return canvasModulePromise;
}

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
  etag: string,
  contentType: "image/png" | "image/svg+xml"
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
        "Content-Type": contentType,
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
    // Ensure Node has canvas DOM globals (DOMMatrix/ImageData/Path2D) before PDF.js loads.
    pdfJsPromise = (async () => {
      await loadCanvasModule();

      const pdfImportPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
      const workerImportPromise = import(
        "pdfjs-dist/legacy/build/pdf.worker.mjs"
      ) as Promise<{
        WorkerMessageHandler?: unknown;
      }>;
      const [pdfjs, worker] = await Promise.all([
        pdfImportPromise,
        workerImportPromise,
      ]);

      // In Node, PDF.js uses fake-worker mode and expects this global handler.
      if (worker?.WorkerMessageHandler) {
        const globalScope = globalThis as Record<string, unknown>;
        globalScope.pdfjsWorker = {
          WorkerMessageHandler: worker.WorkerMessageHandler,
        };
      }

      return pdfjs;
    })().catch((error) => {
      pdfJsPromise = null;
      throw error;
    });
  }
  return pdfJsPromise;
}

function isCanvasMissingError(error: unknown): boolean {
  const message = normalizeErrorMessage(error).toLowerCase();
  return (
    message.includes("@napi-rs/canvas") ||
    message.includes("server canvas renderer unavailable")
  );
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildSvgPreview(
  width: number,
  height: number,
  lines: string[]
): Uint8Array {
  const safeWidth = Math.max(240, Math.floor(width));
  const safeHeight = Math.max(320, Math.floor(height));
  const header = "Text Preview";
  const lineHeight = 20;
  const startY = 52;
  const maxLines = Math.max(6, Math.floor((safeHeight - startY - 18) / lineHeight));
  const renderedLines = lines.slice(0, maxLines);

  const textNodes = renderedLines
    .map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="24" y="${y}" font-size="14" fill="#2f2f2f">${escapeXml(line)}</text>`;
    })
    .join("");

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">`,
    '<rect width="100%" height="100%" fill="#ffffff"/>',
    `<rect x="12" y="12" width="${safeWidth - 24}" height="${safeHeight - 24}" rx="8" fill="#f7f7f7" stroke="#dddddd"/>`,
    `<text x="24" y="34" font-size="13" fill="#6b6b6b" font-family="ui-sans-serif, system-ui">${header}</text>`,
    textNodes,
    "</svg>",
  ].join("");

  return new TextEncoder().encode(svg);
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
): Promise<{ body: Uint8Array; contentType: "image/png" | "image/svg+xml" }> {
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
    try {
      const { createCanvas } = await loadCanvasModule();
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
      return {
        body: new Uint8Array(buffer),
        contentType: "image/png",
      };
    } catch (error) {
      if (!isCanvasMissingError(error)) {
        throw error;
      }

      const textContent = await page.getTextContent();
      const lines = textContent.items
        .map((item) => ("str" in item ? String(item.str).trim() : ""))
        .filter(Boolean)
        .slice(0, 40);

      return {
        body: buildSvgPreview(viewport.width, viewport.height, lines),
        contentType: "image/svg+xml",
      };
    }
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
    return respondImage(request, cached.body, cached.etag, cached.contentType);
  }

  try {
    const bytes = await fetchPdfBytes(target);
    const preview = await renderPdfPreviewImage(bytes, page, width);
    const etag = `"${createHash("sha256").update(preview.body).digest("hex")}"`;

    setCacheEntry(key, {
      body: preview.body,
      etag,
      contentType: preview.contentType,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return respondImage(request, preview.body, etag, preview.contentType);
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
