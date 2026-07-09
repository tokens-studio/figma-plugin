// Minimal Chrome DevTools Protocol (CDP) client for talking to a debug-enabled
// Figma Desktop. Zero external deps: uses Node's built-in `WebSocket` and `fetch`
// globals (Node 22+, where `WebSocket` is a stable global). No plugin required — we evaluate Plugin-API JS
// directly in the renderer execution context where the `figma` global lives.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_PORT = 9222;

// Figma design/file documents. The trailing (design|file)/ avoids matching the
// "recents-and-sharing" / team feed pages, which do not expose `figma`.
const FIGMA_DOC_RE = /figma\.com\/(design|file)\//;

const STATE_DIR = join(homedir(), ".figma-bridge");
const STATE_FILE = join(STATE_DIR, "state.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// `WebSocket` became a stable global in Node 22. Read it off `globalThis` (rather
// than referencing a bare identifier) so older runtimes fail with a clear,
// actionable message instead of a bare `ReferenceError` deep inside connection setup.
function requireWebSocket() {
  const WS = globalThis.WebSocket;
  if (typeof WS !== "function") {
    throw new Error(
      `figma-bridge needs a global WebSocket, which is available in Node 22+. ` +
        `Current runtime: ${process.version}. Please re-run with Node 22 or newer.`,
    );
  }
  return WS;
}

function readState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeState(patch) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify({ ...readState(), ...patch }, null, 2));
  } catch {
    // best-effort cache; ignore failures
  }
}

/** List all CDP targets (pages) exposed by the debug port. */
export async function listTargets(port = DEFAULT_PORT) {
  const res = await fetch(`http://localhost:${port}/json`);
  if (!res.ok) throw new Error(`CDP /json returned ${res.status}`);
  return res.json();
}

/** True if the debug port is up and responding. */
export async function isPortReady(port = DEFAULT_PORT) {
  try {
    const res = await fetch(`http://localhost:${port}/json/version`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Connect to a Figma document target and locate the execution context that owns
 * the `figma` Plugin-API global.
 *
 * Robust against a cold launch: many tabs may be restored but suspended, and the
 * active document's `figma` global appears a few seconds after the debug port opens.
 * We therefore scan every design/file target for a live `figma` context and retry
 * the whole scan until `timeoutMs` elapses.
 *
 * @param {object} [opts]
 * @param {number} [opts.port]       CDP port (default 9222).
 * @param {string} [opts.targetUrl]  Substring/regex to pick a specific target.
 * @param {number} [opts.timeoutMs]  Total time to keep retrying (default 20000).
 * @returns {Promise<Client>}
 */
export async function connect({ port = DEFAULT_PORT, targetUrl, timeoutMs = 20000 } = {}) {
  const deadline = Date.now() + Math.max(0, timeoutMs);
  const lastGood = readState().lastTargetUrl;
  let lastErr = null;

  for (;;) {
    const targets = await listTargets(port);
    const pages = targets.filter((t) => t.type === "page" && t.webSocketDebuggerUrl);

    let candidates;
    if (targetUrl) {
      candidates = pages.filter((t) => t.url.includes(targetUrl) || safeMatch(targetUrl, t.url));
      if (candidates.length === 0) lastErr = new Error(`No target matched "${targetUrl}"`);
    } else {
      candidates = pages.filter((t) => FIGMA_DOC_RE.test(t.url));
      // Try the previously-good document first (fast path + picks the tab you use).
      if (lastGood) {
        candidates.sort((a, b) => (b.url === lastGood ? 1 : 0) - (a.url === lastGood ? 1 : 0));
      }
    }

    for (const target of candidates) {
      const client = new Client(target);
      try {
        await client._open();
        if (await client._findFigmaContext()) {
          writeState({ lastTargetUrl: target.url });
          return client;
        }
      } catch (e) {
        lastErr = e;
      }
      client.close();
    }

    if (Date.now() >= deadline) break;
    await sleep(1000);
  }

  throw (
    lastErr ??
    new Error(
      "No Figma design/file tab with the Plugin API was found. Open or focus a " +
        "document in the debug Figma (the recents/home page does not expose it).",
    )
  );
}

class Client {
  constructor(target) {
    this.target = target;
    this.contextId = null;
    this._ws = null;
    this._nextId = 1;
    this._pending = new Map();
    this._contexts = [];
  }

  _open() {
    return new Promise((resolve, reject) => {
      const WS = requireWebSocket();
      const ws = new WS(this.target.webSocketDebuggerUrl);
      this._ws = ws;
      ws.addEventListener("message", (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (msg.id && this._pending.has(msg.id)) {
          const { resolve: r } = this._pending.get(msg.id);
          this._pending.delete(msg.id);
          r(msg);
          return;
        }
        if (msg.method === "Runtime.executionContextCreated") {
          this._contexts.push(msg.params.context);
        } else if (msg.method === "Runtime.executionContextsCleared") {
          this._contexts = [];
          this.contextId = null;
        }
      });
      ws.addEventListener("open", () => resolve(), { once: true });
      ws.addEventListener(
        "error",
        (e) => reject(new Error(`CDP socket error: ${e?.message ?? e}`)),
        { once: true },
      );
    });
  }

  /** Send a CDP command and await its reply (rejects after `timeoutMs`). */
  _send(method, params = {}, timeoutMs = 15000) {
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(id);
        reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this._pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
      });
      this._ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async _rawEval(expression, { contextId, awaitPromise = true, timeoutMs } = {}) {
    const params = { expression, returnByValue: true, awaitPromise };
    if (contextId != null) params.contextId = contextId;
    const reply = await this._send("Runtime.evaluate", params, timeoutMs);
    return reply.result;
  }

  /**
   * Enable the Runtime domain and find the context exposing `figma`. Polls, because
   * on a freshly loading tab the contexts (and the `figma` global) arrive with a delay.
   * Returns true if found, false otherwise (so the caller can try the next target).
   */
  async _findFigmaContext({ pollMs = 3000 } = {}) {
    await this._send("Runtime.enable");
    const deadline = Date.now() + pollMs;
    for (;;) {
      for (const ctx of this._contexts) {
        try {
          const res = await this._rawEval("typeof figma", {
            contextId: ctx.id,
            awaitPromise: false,
            timeoutMs: 4000,
          });
          if (res?.result?.value && res.result.value !== "undefined") {
            this.contextId = ctx.id;
            return true;
          }
        } catch {
          // suspended/loading context — skip it
        }
      }
      if (Date.now() >= deadline) return false;
      await sleep(250);
    }
  }

  /**
   * Evaluate Plugin-API JavaScript in the Figma renderer.
   *
   * Snippets containing a top-level `return` (or `await`) are wrapped in an async
   * IIFE so you can write multi-statement code and use `await`. A bare expression
   * (e.g. `figma.currentPage.name`) is evaluated directly. Return JSON-serializable
   * values — Figma node objects have methods and won't serialize.
   */
  async eval(code) {
    const needsWrap = /\breturn\b/.test(code) || /\bawait\b/.test(code);
    const expression = needsWrap ? `(async () => { ${code} })()` : code;
    const result = await this._rawEval(expression, { contextId: this.contextId });
    if (result?.exceptionDetails) {
      const ex = result.exceptionDetails;
      const val = ex.exception?.value;
      const msg =
        (val && (typeof val === "string" ? val : JSON.stringify(val))) ||
        ex.exception?.description ||
        ex.text ||
        "eval threw";
      throw new Error(`figma.eval error: ${msg}`);
    }
    return result?.result?.value;
  }

  /**
   * Capture a PNG of the target's **whole rendered viewport** — the Figma window
   * as pixels, including the toolbar, panels and canvas chrome at the current zoom.
   *
   * Use this only when you need to see Figma's own UI (a plugin's iframe, the
   * variables/inspector panels, a state you can't read through the Plugin API).
   * To validate the *content* you drew, prefer {@link Client#exportNode}, which
   * returns just that node's pixels, tightly cropped and zoom-independent.
   */
  async screenshot({ format = "png" } = {}) {
    await this._send("Page.enable");
    const reply = await this._send("Page.captureScreenshot", { format });
    if (!reply.result?.data) throw new Error("captureScreenshot returned no data");
    return Buffer.from(reply.result.data, "base64");
  }

  /**
   * Export a single node's pixels via the Plugin API (`node.exportAsync`) and
   * return them as a Buffer. This is the right way to *visually validate a frame*:
   * the output is exactly that node, tightly cropped at full fidelity, regardless
   * of the current viewport, zoom, or open panels — none of Figma's UI is included.
   *
   * @param {string} nodeId  The node id (e.g. from a created node's `.id`, or a selection).
   * @param {object} [opts]
   * @param {"PNG"|"JPG"|"SVG"} [opts.format]  Export format (default "PNG").
   * @param {number} [opts.scale]              Scale factor for raster formats (default 2).
   * @returns {Promise<Buffer>}
   */
  async exportNode(nodeId, { format = "PNG", scale = 2 } = {}) {
    const id = JSON.stringify(String(nodeId));
    const fmt = JSON.stringify(String(format).toUpperCase());
    const raster = String(format).toUpperCase() !== "SVG";
    let settings = `{ format: ${fmt} }`;
    if (raster) {
      const s = Number(scale);
      if (!Number.isFinite(s) || s <= 0) {
        throw new Error(
          `invalid export scale: ${JSON.stringify(scale)} — must be a positive number`,
        );
      }
      settings = `{ format: ${fmt}, constraint: { type: "SCALE", value: ${s} } }`;
    }
    const b64 = await this.eval(`
      const node = await figma.getNodeByIdAsync(${id});
      if (!node) throw new Error("node not found: " + ${id});
      if (typeof node.exportAsync !== "function") throw new Error("node type " + node.type + " is not exportable");
      const bytes = await node.exportAsync(${settings});
      return figma.base64Encode(bytes);
    `);
    if (typeof b64 !== "string" || !b64) throw new Error("exportNode returned no data");
    return Buffer.from(b64, "base64");
  }

  close() {
    try {
      this._ws?.close();
    } catch {
      // ignore
    }
  }
}

function safeMatch(pattern, str) {
  try {
    return new RegExp(pattern).test(str);
  } catch {
    return false;
  }
}
