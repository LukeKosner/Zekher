const APP_TITLE = "Zekher Lexicon Explorer";

/**
 * Returns the HTML document used by MCP App-capable hosts to render
 * lexicon search results inline.
 */
export function getLexiconExplorerAppHtml(): string {
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
        display: block;
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

      .preview-pdf-pages {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--muted);
      }

      .pdf-status {
        margin: 0;
        text-align: center;
        font-size: 0.75rem;
        color: var(--muted-foreground);
      }

      .pdf-page {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .pdf-page-canvas {
        max-width: 100%;
        display: block;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }

      .preview-fallback {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 12px;
        background: var(--muted);
      }

      .preview-title {
        margin: 0;
        font-size: 0.86rem;
        font-weight: 600;
      }

      .preview-text {
        margin: 8px 0 0;
        font-size: 0.74rem;
        line-height: 1.45;
        color: var(--muted-foreground);
        white-space: pre-wrap;
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
      const state = {
        terms: [],
        sources: [],
        nextSteps: "",
        hasResult: false,
        slideIndex: 0
      };

      const resultsEl = document.getElementById("results");

      const pending = new Map();
      let requestId = 1;
      let resizeRaf = 0;
      let resizeObserver = null;
      let pdfJsLibPromise = null;
      const renderedPdfPreviews = new Set();
      const PDF_JS_MODULE_URL = "/pdf.min.mjs";
      const PDF_WORKER_URL = "/pdf.worker.min.js";

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

        notify("ui/notifications/size-changed", {
          width,
          height
        });
      }

      function scheduleSizeChanged() {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = 0;
          notifySizeChangedNow();
        });
      }

      function previewText(value, max) {
        if (!value) return "";
        const cleaned = String(value).trim().replace(/\s+/g, " ");
        if (cleaned.length <= max) return cleaned;
        return cleaned.slice(0, max).trimEnd() + "...";
      }

      async function loadPdfJs() {
        if (!pdfJsLibPromise) {
          pdfJsLibPromise = import(PDF_JS_MODULE_URL)
            .then((mod) => {
              if (mod && mod.GlobalWorkerOptions) {
                mod.GlobalWorkerOptions.workerSrc = new URL(
                  PDF_WORKER_URL,
                  window.location.origin
                ).toString();
              }
              return mod;
            })
            .catch((error) => {
              pdfJsLibPromise = null;
              throw error;
            });
        }
        return pdfJsLibPromise;
      }

      function isSlideNearViewport(container) {
        const slide = container.closest(".carousel-slide");
        if (!slide) return true;
        const rect = slide.getBoundingClientRect();
        return rect.right >= -48 && rect.left <= window.innerWidth + 48;
      }

      async function renderPdfPreview(container) {
        const sourceId = container.getAttribute("data-source-id");
        const pdfUrl = container.getAttribute("data-pdf-url");
        const title = container.getAttribute("data-title") || "Untitled";
        const text = container.getAttribute("data-text") || "";

        if (!sourceId || !pdfUrl || renderedPdfPreviews.has(sourceId)) return;

        renderedPdfPreviews.add(sourceId);
        container.innerHTML = '<p class="pdf-status">Loading pages...</p>';
        scheduleSizeChanged();

        try {
          const pdfjsLib = await loadPdfJs();
          const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            withCredentials: false
          });
          const pdf = await loadingTask.promise;

          container.innerHTML = "";
          const availableWidth = Math.max(220, container.clientWidth - 12);

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
            const page = await pdf.getPage(pageNum);
            const baseViewport = page.getViewport({ scale: 1 });
            const scale = availableWidth / baseViewport.width;
            const viewport = page.getViewport({ scale });
            const outputScale = window.devicePixelRatio || 1;

            const pageWrap = document.createElement("div");
            pageWrap.className = "pdf-page";

            const canvas = document.createElement("canvas");
            canvas.className = "pdf-page-canvas";
            canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
            canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            pageWrap.appendChild(canvas);
            container.appendChild(pageWrap);

            const context = canvas.getContext("2d", { alpha: false });
            if (!context) continue;

            await page.render({
              canvasContext: context,
              viewport,
              transform:
                outputScale !== 1
                  ? [outputScale, 0, 0, outputScale, 0, 0]
                  : null
            }).promise;
          }

          if (!container.children.length) {
            throw new Error("No PDF pages rendered");
          }
        } catch (error) {
          renderedPdfPreviews.delete(sourceId);
          container.innerHTML = [
            '<div class="preview-fallback">',
            '<h3 class="preview-title">' + escapeHtml(title) + "</h3>",
            '<p class="preview-text">' + escapeHtml(text) + "</p>",
            "</div>"
          ].join("");
          const message = error && error.message ? error.message : "unknown error";
          setStatus("PDF preview unavailable for " + title + ": " + message);
        } finally {
          scheduleSizeChanged();
        }
      }

      function schedulePdfPreviews() {
        const containers = document.querySelectorAll("[data-preview-type='pdf']");
        containers.forEach((container) => {
          if (!(container instanceof HTMLElement)) return;
          if (!isSlideNearViewport(container)) return;
          void renderPdfPreview(container);
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

      function renderSlide(source) {
        const id = escapeHtml(source.id || "");
        const entryUrl = escapeHtml(source.citationUrl || source.redirectUrl || "#");
        const title = escapeHtml(source.title || "Untitled");
        const text = escapeHtml(previewText(source.content || "", 550));
        const rawPdfUrl = source.pdfUrl ? escapeHtml(source.pdfUrl) : "";

        const preview = rawPdfUrl
          ? [
              '<div class="preview-pdf-pages" data-preview-type="pdf" data-source-id="' +
                id +
                '" data-pdf-url="' +
                rawPdfUrl +
                '" data-title="' +
                title +
                '" data-text="' +
                text +
                '">',
              '<p class="pdf-status">Loading pages...</p>',
              '</div>',
            ].join("")
          : [
              '<div class="preview-fallback">',
              '<h3 class="preview-title">' + title + '</h3>',
              '<p class="preview-text">' + text + '</p>',
              '</div>'
            ].join("");

        return [
          '<div class="carousel-slide">',
          '  <a class="preview-link" href="' + entryUrl + '" target="_blank" rel="noopener noreferrer">',
          '    ' + preview,
          '  </a>',
          '  <p class="citation-row">',
          '    <a href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html" target="_blank" rel="noopener noreferrer">Yad Vashem</a>',
          '    •',
          '    <a class="view-entry" href="' + entryUrl + '" target="_blank" rel="noopener noreferrer">',
          '      View Entry <span class="ext">↗</span>',
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

        const slides = state.sources.map(renderSlide).join("");

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
          schedulePdfPreviews();
        });
        scheduleSizeChanged();
      }

      function onNotification(method, params) {
        if (method === "ui/notifications/tool-input") {
          const args = params && params.arguments ? params.arguments : {};
          const terms = Array.isArray(args.terms) ? args.terms : [];
          state.terms = terms;
          state.hasResult = false;
          state.slideIndex = 0;
          renderedPdfPreviews.clear();
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
          renderedPdfPreviews.clear();

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

      function notify(method, params) {
        window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
      }

      function request(method, params) {
        return new Promise((resolve, reject) => {
          const id = requestId++;
          pending.set(id, { resolve, reject });
          window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");

          setTimeout(() => {
            if (pending.has(id)) {
              pending.delete(id);
              reject(new Error("Request timed out: " + method));
            }
          }, 20000);
        });
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
          schedulePdfPreviews();
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
