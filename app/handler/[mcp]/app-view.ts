const APP_TITLE = "Zekher Lexicon Explorer";

type AppViewOptions = {
  readPdfBytesToolName: string;
  pdfjsModuleUrl: string;
  pdfjsWorkerUrl: string;
};

/**
 * Returns the HTML document used by MCP App-capable hosts to render
 * lexicon search results inline.
 */
export function getLexiconExplorerAppHtml(options: AppViewOptions): string {
  const serializedConfig = JSON.stringify(options);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${APP_TITLE}</title>
    <style>
      :root {
        color-scheme: light dark;
        --background: #ffffff;
        --foreground: #171717;
        --card: #ffffff;
        --muted: #f5f5f5;
        --muted-foreground: #737373;
        --border: #e5e5e5;
        --badge-bg: #f3f4f6;
        --success: #16a34a;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --background: #171717;
          --foreground: #fafafa;
          --card: #262626;
          --muted: #2a2a2a;
          --muted-foreground: #a3a3a3;
          --border: rgba(255, 255, 255, 0.12);
          --badge-bg: #262626;
          --success: #4ade80;
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: var(--background);
        color: var(--foreground);
      }

      .app {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
      }

      .tool-shell {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 6px;
        overflow: hidden;
        background: var(--card);
      }

      .tool-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px;
      }

      .tool-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tool-icon {
        width: 16px;
        height: 16px;
        color: var(--muted-foreground);
      }

      .tool-name {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        padding: 3px 10px;
        background: var(--badge-bg);
        font-size: 0.75rem;
        color: var(--muted-foreground);
        border: 1px solid var(--border);
      }

      .badge-check {
        width: 16px;
        height: 16px;
        color: var(--success);
      }

      .badge-clock {
        display: inline-flex;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        border: 1.8px solid currentColor;
        position: relative;
        animation: pulse 1.1s ease-in-out infinite;
      }

      .badge-clock::before {
        content: "";
        width: 1px;
        height: 5px;
        background: currentColor;
        position: absolute;
        left: 7px;
        top: 2px;
      }

      .badge-clock::after {
        content: "";
        width: 3px;
        height: 1px;
        background: currentColor;
        position: absolute;
        left: 7px;
        top: 8px;
      }

      @keyframes pulse {
        0% { opacity: 0.45; }
        50% { opacity: 1; }
        100% { opacity: 0.45; }
      }

      .tool-body {
        border-top: 1px solid var(--border);
        padding: 16px;
        overflow: hidden;
      }

      .empty {
        font-size: 0.86rem;
        color: var(--muted-foreground);
      }

      .carousel {
        position: relative;
        margin: 0 auto;
        width: 100%;
      }

      .carousel-viewport {
        overflow: hidden;
      }

      .carousel-track {
        display: flex;
        margin-left: -8px;
        transition: transform 0.22s ease;
        will-change: transform;
      }

      .carousel-slide {
        flex: 0 0 100%;
        padding-left: 8px;
      }

      @media (min-width: 768px) {
        .carousel-track {
          margin-left: -16px;
        }

        .carousel-slide {
          padding-left: 16px;
        }
      }

      @media (min-width: 1280px) {
        .carousel-slide {
          flex: 0 0 50%;
        }
      }

      .preview-link {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        border-radius: 6px;
        overflow: hidden;
        height: 224px;
        background: var(--muted);
        text-decoration: none;
        color: inherit;
      }

      .preview-link:hover {
        opacity: 0.92;
      }

      .preview-canvas-shell {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .preview-canvas {
        max-width: 100%;
        max-height: 100%;
        display: block;
        background: #ffffff;
      }

      .preview-loading,
      .preview-error,
      .preview-empty {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px;
        font-size: 0.78rem;
        line-height: 1.35;
        color: var(--muted-foreground);
      }

      .preview-error {
        color: #dc2626;
      }

      .citation-row {
        margin-top: 8px;
        padding-top: 8px;
        text-align: center;
        font-size: 0.75rem;
        color: var(--muted-foreground);
      }

      .citation-row a {
        color: inherit;
      }

      .view-entry {
        text-decoration: underline;
      }

      .ext {
        display: inline-block;
        margin-left: 4px;
      }

      .carousel-nav {
        position: absolute;
        bottom: 32px;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: color-mix(in oklab, var(--background) 82%, transparent);
        color: var(--foreground);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
        backdrop-filter: blur(6px);
        z-index: 10;
      }

      .carousel-nav.prev {
        left: 8px;
      }

      .carousel-nav.next {
        right: 8px;
      }

      .carousel-nav:disabled {
        opacity: 0.4;
        cursor: default;
      }

      @media (min-width: 768px) {
        .carousel-nav.prev {
          left: 16px;
        }

        .carousel-nav.next {
          right: 16px;
        }
      }

      .carousel-nav svg {
        width: 18px;
        height: 18px;
      }
    </style>
  </head>
  <body>
    <main class="app">
      <section id="results"></section>
    </main>

    <script>
      const APP_CONFIG = ${serializedConfig};
      const MAX_TOOL_RANGE_BYTES = 512 * 1024;

      const state = {
        terms: [],
        sources: [],
        nextSteps: "",
        hasResult: false,
        slideIndex: 0
      };

      const resultsEl = document.getElementById("results");
      const pending = new Map();
      const previewRendered = new Set();
      const previewInFlight = new Set();
      const pdfDocCache = new Map();
      let requestId = 1;
      let resizeRaf = 0;
      let resizeObserver = null;
      let pdfjsModulePromise = null;

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function getSlidesPerView() {
        return window.matchMedia("(min-width: 1280px)").matches ? 2 : 1;
      }

      function maxSlideIndex() {
        return Math.max(0, state.sources.length - getSlidesPerView());
      }

      function clampSlideIndex() {
        if (state.slideIndex < 0) state.slideIndex = 0;
        const max = maxSlideIndex();
        if (state.slideIndex > max) state.slideIndex = max;
      }

      function updateCarouselPosition() {
        const track = document.querySelector("[data-carousel-track]");
        if (!track) return;

        clampSlideIndex();
        const perView = getSlidesPerView();
        const percent = state.slideIndex * (100 / perView);
        track.style.transform = "translateX(-" + percent + "%)";

        const prevBtn = document.querySelector("[data-carousel-nav='prev']");
        const nextBtn = document.querySelector("[data-carousel-nav='next']");
        const atStart = state.slideIndex <= 0;
        const atEnd = state.slideIndex >= maxSlideIndex();

        if (prevBtn) prevBtn.disabled = atStart;
        if (nextBtn) nextBtn.disabled = atEnd;
      }

      function setStatus(text) {
        window.__zekherStatus = text;
      }

      function notifySizeChangedNow() {
        const root = document.documentElement;
        const body = document.body;
        const width = Math.max(
          root ? root.scrollWidth : 0,
          root ? root.offsetWidth : 0,
          body ? body.scrollWidth : 0,
          body ? body.offsetWidth : 0
        );
        const height = Math.max(
          root ? root.scrollHeight : 0,
          root ? root.offsetHeight : 0,
          body ? body.scrollHeight : 0,
          body ? body.offsetHeight : 0
        );

        notify("ui/notifications/size-changed", { width, height });
      }

      function scheduleSizeChanged() {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = 0;
          notifySizeChangedNow();
        });
      }

      function renderHeader() {
        const isCompleted = state.hasResult;
        const badge = isCompleted
          ? '<span class="badge"><svg class="badge-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8.6 12.2L10.9 14.4L15.5 9.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Completed</span>'
          : '<span class="badge"><span class="badge-clock"></span>Searching...</span>';

        return [
          '<div class="tool-header">',
          '  <div class="tool-left">',
          '    <svg class="tool-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19.5V5.5A1.5 1.5 0 0 1 5.5 4H20v14H5.5A1.5 1.5 0 0 0 4 19.5ZM4 19.5A1.5 1.5 0 0 0 5.5 21H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 9h8M8 13h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
          '    <span class="tool-name">Holocaust Lexicon</span>',
          '    ' + badge,
          '  </div>',
          '</div>'
        ].join("");
      }

      function renderSlide(source, index) {
        const entryUrl = escapeHtml(source.citationUrl || source.redirectUrl || "#");
        const title = escapeHtml(source.title || "Untitled");

        const preview = source.pdfUrl
          ? [
              '<div class="preview-canvas-shell" data-preview-root data-source-index="' + index + '">',
              '  <canvas class="preview-canvas" data-preview-canvas hidden></canvas>',
              '  <div class="preview-loading" data-preview-loading>Loading PDF preview...</div>',
              '  <div class="preview-error" data-preview-error hidden>PDF preview unavailable.</div>',
              '</div>'
            ].join("")
          : '<div class="preview-empty">PDF unavailable for this entry.</div>';

        return [
          '<div class="carousel-slide">',
          '  <a class="preview-link" href="' + entryUrl + '" target="_blank" rel="noopener noreferrer" title="' + title + '">',
          preview,
          '  </a>',
          '  <p class="citation-row">',
          '    <a href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html" target="_blank" rel="noopener noreferrer">Yad Vashem</a>',
          '    •',
          '    <a class="view-entry" href="' + entryUrl + '" target="_blank" rel="noopener noreferrer">',
          '      View Entry <span class="ext">-></span>',
          '    </a>',
          '  </p>',
          '</div>'
        ].join("");
      }

      function renderBody() {
        if (!state.hasResult) return "";

        if (!state.sources.length) {
          return [
            '<div class="tool-body">',
            '  <p class="empty">No matching lexicon entries were found.</p>',
            '</div>'
          ].join("");
        }

        const slides = state.sources.map((source, index) => renderSlide(source, index)).join("");

        return [
          '<div class="tool-body">',
          '  <div class="carousel">',
          '    <div class="carousel-viewport">',
          '      <div class="carousel-track" data-carousel-track>',
          slides,
          '      </div>',
          '    </div>',
          '    <button class="carousel-nav prev" data-carousel-nav="prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
          '    <button class="carousel-nav next" data-carousel-nav="next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
          '  </div>',
          '</div>'
        ].join("");
      }

      function render() {
        const html = [
          '<section class="tool-shell">',
          renderHeader(),
          renderBody(),
          '</section>'
        ].join("");

        resultsEl.innerHTML = html;
        requestAnimationFrame(() => {
          updateCarouselPosition();
          renderPdfPreviews();
        });
        scheduleSizeChanged();
      }

      function notify(method, params) {
        window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
      }

      function request(method, params, timeoutMs = 45000) {
        return new Promise((resolve, reject) => {
          const id = requestId++;
          pending.set(id, { resolve, reject });
          window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");

          setTimeout(() => {
            if (pending.has(id)) {
              pending.delete(id);
              reject(new Error("Request timed out: " + method));
            }
          }, timeoutMs);
        });
      }

      async function getPdfjsModule() {
        if (!pdfjsModulePromise) {
          pdfjsModulePromise = import(APP_CONFIG.pdfjsModuleUrl)
            .then((module) => {
              const pdfjs = module && typeof module.getDocument === "function"
                ? module
                : module && module.default && typeof module.default.getDocument === "function"
                  ? module.default
                  : null;

              if (!pdfjs) {
                throw new Error("Failed to load PDF.js module");
              }

              if (pdfjs.GlobalWorkerOptions) {
                pdfjs.GlobalWorkerOptions.workerSrc = APP_CONFIG.pdfjsWorkerUrl;
              }

              return pdfjs;
            })
            .catch((error) => {
              pdfjsModulePromise = null;
              throw error;
            });
        }

        return pdfjsModulePromise;
      }

      async function callReadPdfBytes(url, offset, byteCount) {
        const result = await request("tools/call", {
          name: APP_CONFIG.readPdfBytesToolName,
          arguments: {
            url,
            offset,
            byteCount,
          },
        });

        if (result && result.isError) {
          const content = Array.isArray(result.content) ? result.content : [];
          const firstText = content.find((item) => item && item.type === "text" && typeof item.text === "string");
          throw new Error(firstText ? firstText.text : "PDF byte read failed");
        }

        const structured = result && result.structuredContent ? result.structuredContent : null;
        if (!structured || typeof structured.dataBase64 !== "string") {
          throw new Error("PDF byte read returned invalid structuredContent");
        }

        return structured;
      }

      function base64ToUint8Array(base64Value) {
        const binary = atob(base64Value);
        const length = binary.length;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }

      async function getPdfDocument(pdfUrl) {
        if (!pdfUrl) {
          throw new Error("Missing PDF URL");
        }

        if (!pdfDocCache.has(pdfUrl)) {
          const promise = (async () => {
            const pdfjs = await getPdfjsModule();
            const meta = await callReadPdfBytes(pdfUrl, 0, 1);
            const totalBytes = Number(meta.totalBytes);

            if (!Number.isFinite(totalBytes) || totalBytes <= 0) {
              throw new Error("Invalid PDF length");
            }

            const transport = new pdfjs.PDFDataRangeTransport(totalBytes, null);

            transport.requestDataRange = (begin, end) => {
              void (async () => {
                let cursor = begin;
                try {
                  while (cursor < end) {
                    const wanted = Math.min(MAX_TOOL_RANGE_BYTES, end - cursor);
                    const chunk = await callReadPdfBytes(pdfUrl, cursor, wanted);
                    const bytes = base64ToUint8Array(chunk.dataBase64);

                    if (!bytes.byteLength) {
                      throw new Error("Empty PDF range payload");
                    }

                    transport.onDataRange(cursor, bytes);
                    cursor += bytes.byteLength;

                    if (bytes.byteLength < wanted) {
                      break;
                    }
                  }
                } catch (error) {
                  if (typeof transport.abort === "function") {
                    transport.abort();
                  }
                }
              })();
            };

            transport.transportReady();

            const loadingTask = pdfjs.getDocument({
              length: totalBytes,
              range: transport,
              disableStream: true,
              disableAutoFetch: false,
              rangeChunkSize: MAX_TOOL_RANGE_BYTES,
            });

            return loadingTask.promise;
          })().catch((error) => {
            pdfDocCache.delete(pdfUrl);
            throw error;
          });

          pdfDocCache.set(pdfUrl, promise);
        }

        return pdfDocCache.get(pdfUrl);
      }

      function previewKeyForSource(source) {
        return String(source.id || "") + "::" + String(source.pdfUrl || "");
      }

      async function renderSinglePdfPreview(source, rootEl) {
        const canvas = rootEl.querySelector("[data-preview-canvas]");
        const loading = rootEl.querySelector("[data-preview-loading]");
        const error = rootEl.querySelector("[data-preview-error]");

        if (!(canvas instanceof HTMLCanvasElement)) return;

        if (loading) loading.hidden = false;
        if (error) error.hidden = true;
        canvas.hidden = true;

        try {
          const pdfDocument = await getPdfDocument(source.pdfUrl);
          const firstPage = await pdfDocument.getPage(1);

          if (!document.contains(rootEl)) {
            return;
          }

          const containerWidth = Math.max(1, rootEl.clientWidth || 320);
          const containerHeight = Math.max(1, rootEl.clientHeight || 224);
          const baseViewport = firstPage.getViewport({ scale: 1 });
          const scale = Math.max(
            0.1,
            Math.min(containerWidth / baseViewport.width, containerHeight / baseViewport.height)
          );
          const viewport = firstPage.getViewport({ scale });
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

          canvas.width = Math.max(1, Math.floor(viewport.width * pixelRatio));
          canvas.height = Math.max(1, Math.floor(viewport.height * pixelRatio));
          canvas.style.width = Math.max(1, Math.floor(viewport.width)) + "px";
          canvas.style.height = Math.max(1, Math.floor(viewport.height)) + "px";

          const context = canvas.getContext("2d", { alpha: false });
          if (!context) {
            throw new Error("Canvas 2D context unavailable");
          }

          context.setTransform(1, 0, 0, 1, 0, 0);
          context.clearRect(0, 0, canvas.width, canvas.height);

          await firstPage.render({
            canvasContext: context,
            viewport,
            transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0],
          }).promise;

          canvas.hidden = false;
          if (loading) loading.hidden = true;
          if (error) error.hidden = true;
        } catch (previewError) {
          if (loading) loading.hidden = true;
          if (error) error.hidden = false;
          console.warn("PDF preview render failed", previewError);
        } finally {
          scheduleSizeChanged();
        }
      }

      function renderPdfPreviews() {
        const roots = document.querySelectorAll("[data-preview-root]");
        for (const rootEl of roots) {
          const indexValue = Number(rootEl.getAttribute("data-source-index"));
          if (!Number.isFinite(indexValue)) continue;

          const source = state.sources[indexValue];
          if (!source || !source.pdfUrl) continue;

          const key = previewKeyForSource(source);
          if (previewRendered.has(key) || previewInFlight.has(key)) continue;

          previewInFlight.add(key);
          void renderSinglePdfPreview(source, rootEl)
            .finally(() => {
              previewInFlight.delete(key);
              previewRendered.add(key);
            });
        }
      }

      function onNotification(method, params) {
        if (method === "ui/notifications/tool-input") {
          const args = params && params.arguments ? params.arguments : {};
          const terms = Array.isArray(args.terms) ? args.terms : [];
          state.terms = terms;
          state.hasResult = false;
          state.slideIndex = 0;
          previewRendered.clear();
          previewInFlight.clear();
          if (terms.length) setStatus("Search terms: " + terms.join(", "));
          render();
          return;
        }

        if (method === "ui/notifications/tool-result") {
          const structured = params && params.structuredContent ? params.structuredContent : {};
          const sources = Array.isArray(structured.sources) ? structured.sources : [];

          state.terms = Array.isArray(structured.queryTerms)
            ? structured.queryTerms
            : state.terms;

          state.sources = sources.map((source) => ({
            id: source.id,
            title: source.title,
            content: source.content,
            citationUrl: source.citationUrl,
            redirectUrl: source.redirectUrl,
            pdfUrl: source.pdfUrl,
            txtUrl: source.txtUrl
          }));

          state.nextSteps = structured.nextSteps || "";
          state.hasResult = true;
          state.slideIndex = 0;
          previewRendered.clear();
          previewInFlight.clear();

          if (state.sources.length) {
            setStatus(
              "Loaded " +
                state.sources.length +
                " source" +
                (state.sources.length === 1 ? "" : "s") +
                "."
            );
          } else {
            setStatus("No matching lexicon entries were found.");
          }

          render();
        }
      }

      window.addEventListener("message", (event) => {
        const msg = event.data;
        if (!msg || msg.jsonrpc !== "2.0") return;

        if (typeof msg.id !== "undefined") {
          const waiter = pending.get(msg.id);
          if (!waiter) return;
          pending.delete(msg.id);
          if (msg.error) {
            waiter.reject(new Error(msg.error.message || "Request failed"));
          } else {
            waiter.resolve(msg.result);
          }
          return;
        }

        if (msg.method) {
          onNotification(msg.method, msg.params || {});
        }
      });

      window.addEventListener("resize", () => {
        updateCarouselPosition();
        scheduleSizeChanged();
      });

      document.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        const navBtn = target.closest("[data-carousel-nav]");
        if (navBtn) {
          const direction = navBtn.getAttribute("data-carousel-nav");
          if (direction === "prev") state.slideIndex -= 1;
          if (direction === "next") state.slideIndex += 1;
          updateCarouselPosition();
          return;
        }
      });

      async function initialize() {
        try {
          await request("ui/initialize", {
            protocolVersion: "2026-01-26",
            appInfo: { name: "zekher-lexicon-view", version: "1.0.0" },
            appCapabilities: { availableDisplayModes: ["inline", "fullscreen"] }
          });

          notify("ui/notifications/initialized", {});
          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
              scheduleSizeChanged();
            });
            resizeObserver.observe(document.documentElement);
            resizeObserver.observe(document.body);
          }
          setStatus("Connected. Waiting for search result...");
          render();
        } catch (error) {
          const message = error && error.message ? error.message : "unknown error";
          setStatus("Initialization error: " + message);
        }
      }

      initialize();
    </script>
  </body>
</html>`;
}
