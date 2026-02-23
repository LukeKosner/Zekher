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
        --bg: #f5f5f4;
        --panel: #ffffff;
        --ink: #1f2937;
        --muted: #6b7280;
        --border: #d6d3d1;
        --accent: #0f766e;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #111827;
          --panel: #1f2937;
          --ink: #e5e7eb;
          --muted: #9ca3af;
          --border: #374151;
          --accent: #5eead4;
        }
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: linear-gradient(180deg, color-mix(in oklab, var(--bg) 92%, #14b8a6 8%) 0%, var(--bg) 100%);
        color: var(--ink);
      }
      .app {
        max-width: 1000px;
        margin: 0 auto;
        padding: 16px;
        display: grid;
        gap: 12px;
      }
      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
      }
      h1 {
        margin: 0;
        font-size: 1.1rem;
      }
      .muted {
        color: var(--muted);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      .chip {
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: color-mix(in oklab, var(--panel) 90%, var(--accent) 10%);
        font-size: 0.85rem;
      }
      .grid {
        display: grid;
        gap: 10px;
      }
      .result {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px;
        background: color-mix(in oklab, var(--panel) 98%, var(--accent) 2%);
      }
      .result h2 {
        margin: 0 0 6px;
        font-size: 1rem;
      }
      .excerpt {
        margin: 0;
        font-size: 0.94rem;
        line-height: 1.45;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      button,
      a.link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 0.84rem;
        color: var(--ink);
        background: var(--panel);
        text-decoration: none;
        cursor: pointer;
      }
      button.primary {
        border-color: color-mix(in oklab, var(--accent) 55%, var(--border) 45%);
        background: color-mix(in oklab, var(--accent) 16%, var(--panel) 84%);
      }
      .detail {
        white-space: pre-wrap;
        line-height: 1.5;
        font-size: 0.92rem;
        max-height: 260px;
        overflow: auto;
        border: 1px dashed var(--border);
        border-radius: 8px;
        padding: 10px;
        margin-top: 10px;
      }
      .status {
        font-size: 0.9rem;
      }
      .empty {
        padding: 18px;
        border: 1px dashed var(--border);
        border-radius: 10px;
      }
    </style>
  </head>
  <body>
    <main class="app">
      <section class="panel">
        <h1>${APP_TITLE}</h1>
        <p class="muted status" id="status">Waiting for tool result...</p>
        <div class="chips" id="chips"></div>
      </section>
      <section class="panel">
        <div id="results" class="grid"></div>
      </section>
    </main>
    <script>
      const state = {
        terms: [],
        sources: [],
        nextSteps: "",
        details: Object.create(null),
        initialized: false
      };

      const statusEl = document.getElementById("status");
      const chipsEl = document.getElementById("chips");
      const resultsEl = document.getElementById("results");

      const pending = new Map();
      let requestId = 1;

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function setStatus(text) {
        statusEl.textContent = text;
      }

      function excerpt(value, max = 360) {
        if (!value) return "";
        const cleaned = String(value).trim();
        if (cleaned.length <= max) return cleaned;
        return cleaned.slice(0, max).trimEnd() + "...";
      }

      function render() {
        chipsEl.innerHTML = "";
        for (const term of state.terms) {
          const el = document.createElement("span");
          el.className = "chip";
          el.textContent = term;
          chipsEl.appendChild(el);
        }

        if (!state.sources.length) {
          resultsEl.innerHTML =
            '<div class="empty muted">No lexicon entries returned for this query yet.</div>';
          return;
        }

        const cards = state.sources.map((source) => {
          const detail = state.details[source.id];
          return [
            '<article class="result">',
            '<h2>' + escapeHtml(source.title) + '</h2>',
            '<p class="excerpt">' + escapeHtml(excerpt(source.content)) + '</p>',
            '<div class="row">',
            '<a class="link" href="' + escapeHtml(source.citationUrl || source.redirectUrl || "") + '" target="_blank" rel="noopener noreferrer">Open Source</a>',
            '<button class="primary" data-source-id="' + escapeHtml(source.id) + '">Load Full Entry</button>',
            '</div>',
            detail ? '<div class="detail">' + escapeHtml(detail.content) + '</div>' : "",
            '</article>'
          ].join("");
        });

        resultsEl.innerHTML = cards.join("");
      }

      function onNotification(method, params) {
        if (method === "ui/notifications/tool-input") {
          const args = params && params.arguments ? params.arguments : {};
          const terms = Array.isArray(args.terms) ? args.terms : [];
          state.terms = terms;
          if (terms.length) setStatus("Search terms: " + terms.join(", "));
          render();
          return;
        }

        if (method === "ui/notifications/tool-result") {
          const structured = params && params.structuredContent ? params.structuredContent : {};
          const sources = Array.isArray(structured.sources) ? structured.sources : [];
          state.terms = Array.isArray(structured.queryTerms) ? structured.queryTerms : state.terms;
          state.sources = sources.map((source) => ({
            id: source.id,
            title: source.title,
            content: source.content,
            citationUrl: source.citationUrl,
            redirectUrl: source.redirectUrl
          }));
          state.nextSteps = structured.nextSteps || "";

          if (state.sources.length) {
            setStatus("Loaded " + state.sources.length + " source" + (state.sources.length === 1 ? "" : "s") + ".");
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

      document.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const sourceId = target.getAttribute("data-source-id");
        if (!sourceId) return;

        target.setAttribute("disabled", "true");
        target.textContent = "Loading...";
        try {
          const result = await request("tools/call", {
            name: "yad_vashem_lexicon_entry_detail",
            arguments: { sourceId }
          });
          const entry = result && result.structuredContent ? result.structuredContent.entry : null;
          if (entry && entry.id) {
            state.details[entry.id] = entry;
            setStatus("Loaded full text for " + entry.title + ".");
            render();
          } else {
            setStatus("Unable to load entry details.");
          }
        } catch (error) {
          setStatus("Detail request failed: " + (error && error.message ? error.message : "unknown error"));
        } finally {
          target.removeAttribute("disabled");
          target.textContent = "Load Full Entry";
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
          state.initialized = true;
          setStatus("Connected. Waiting for search result...");
          render();
        } catch (error) {
          setStatus("Initialization error: " + (error && error.message ? error.message : "unknown error"));
        }
      }

      initialize();
    </script>
  </body>
</html>`;
}
