// Lifecycle for a debug-enabled copy of Figma Desktop (macOS).
//
// Strategy (zero-touch): copy /Applications/Figma.app into ~/.figma-bridge, flip
// one byte in the copy's app.asar so Figma stops stripping --remote-debugging-port,
// ad-hoc re-sign the copy, then launch it with the debug port. The copy shares the
// logged-in profile, so it reopens your recent files. No system permission needed.
//
// If the copied-app route ever fails (e.g. Gatekeeper), the same patch can be applied
// to the installed app after granting Terminal "App Management" in System Settings —
// see README.md.

import { execFile, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { DEFAULT_PORT, connect, isPortReady } from "./cdp.mjs";

const execFileAsync = promisify(execFile);

export const SRC_APP = "/Applications/Figma.app";
export const BRIDGE_DIR = join(homedir(), ".figma-bridge");
export const DEBUG_APP = join(BRIDGE_DIR, "FigmaDebug.app");
export const DEBUG_BIN = join(DEBUG_APP, "Contents/MacOS/Figma");
export const DEBUG_ASAR = join(DEBUG_APP, "Contents/Resources/app.asar");
export const LOG_FILE = join(BRIDGE_DIR, "figma.log");

// One-byte flip: Figma calls removeSwitch("remote-debugging-port") to drop the
// flag; corrupting the switch name to "remote-debugXing-port" makes that call a
// no-op, so our --remote-debugging-port survives. Same length => asar stays valid.
const BLOCK = 'removeSwitch("remote-debugging-port")';
const PATCH = 'removeSwitch("remote-debugXing-port")';

function assertMacSourceApp() {
  if (process.platform !== "darwin") throw new Error("figma-bridge currently supports macOS only.");
  if (!existsSync(SRC_APP)) throw new Error(`Figma not found at ${SRC_APP}. Install Figma Desktop first.`);
}

/** Clone /Applications/Figma.app into the bridge dir (fast APFS clone via ditto). */
export function ensureDebugApp({ force = false } = {}) {
  assertMacSourceApp();
  mkdirSync(BRIDGE_DIR, { recursive: true });
  if (force && existsSync(DEBUG_APP)) rmSync(DEBUG_APP, { recursive: true, force: true });
  if (!existsSync(DEBUG_APP)) {
    execFileSync("ditto", [SRC_APP, DEBUG_APP]);
  }
}

export function asarState() {
  const buf = readFileSync(DEBUG_ASAR);
  if (buf.includes(PATCH)) return "patched";
  if (buf.includes(BLOCK)) return "unpatched";
  return "unknown";
}

/** Apply the byte-flip to the copy's asar (idempotent). */
export function patch() {
  const buf = readFileSync(DEBUG_ASAR);
  if (buf.includes(PATCH)) return false; // already patched
  const i = buf.indexOf(BLOCK);
  if (i === -1) throw new Error("Patch anchor not found in app.asar (Figma internals may have changed).");
  Buffer.from(PATCH).copy(buf, i);
  writeFileSync(DEBUG_ASAR, buf);
  return true;
}

/** Revert the byte-flip (used before re-cloning / cleanup). */
export function unpatch() {
  const buf = readFileSync(DEBUG_ASAR);
  const i = buf.indexOf(PATCH);
  if (i === -1) return false;
  Buffer.from(BLOCK).copy(buf, i);
  writeFileSync(DEBUG_ASAR, buf);
  return true;
}

/** Ad-hoc re-sign the copy so macOS will launch the modified bundle. */
export function sign() {
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", DEBUG_APP]);
}

/** Clone + patch + sign, only doing the work that isn't already done. */
export function prepare({ force = false } = {}) {
  ensureDebugApp({ force });
  const didPatch = patch();
  if (didPatch || force) sign();
  return { app: DEBUG_APP, patched: asarState() === "patched" };
}

/** PIDs of any running process named exactly "Figma" (installed OR our copy). */
export function runningPids() {
  try {
    const out = execFileSync("pgrep", ["-x", "Figma"], { encoding: "utf8" });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch {
    return []; // pgrep exits non-zero when nothing matches
  }
}

/** Gracefully quit any running Figma (lets it sync + prompt on unsaved work). */
export async function quitFigma({ timeoutMs = 15000 } = {}) {
  if (runningPids().length === 0) return true;
  try {
    await execFileAsync("osascript", ["-e", 'tell application "Figma" to quit']);
  } catch {
    // fall through to polling; app may already be closing
  }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (runningPids().length === 0) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return runningPids().length === 0;
}

/**
 * Launch the debug copy with the remote debugging port and wait until the Plugin
 * API is actually usable (not just the port). Quits any running Figma first
 * (installed and debug share one profile → one at a time).
 */
export async function start({ port = DEFAULT_PORT, waitMs = 45000 } = {}) {
  prepare();

  const quit = await quitFigma();
  if (!quit) {
    throw new Error("A Figma instance is still running (possibly blocked on an unsaved-changes dialog).");
  }

  mkdirSync(BRIDGE_DIR, { recursive: true });
  const fd = openSync(LOG_FILE, "a");
  const child = spawn(DEBUG_BIN, [`--remote-debugging-port=${port}`], {
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  child.unref();

  const deadline = Date.now() + waitMs;

  // Phase 1: wait for the CDP port to accept connections.
  let portUp = false;
  while (Date.now() < deadline) {
    if (await isPortReady(port)) {
      portUp = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!portUp) {
    throw new Error(`Debug port ${port} did not come up within ${waitMs}ms. See ${LOG_FILE}.`);
  }

  // Phase 2: wait until a document's `figma` global is evaluable. The port opens
  // several seconds before the renderer injects the Plugin API, and restored tabs
  // may be suspended — connect() scans + retries for us.
  const remaining = Math.max(2000, deadline - Date.now());
  let client;
  try {
    client = await connect({ port, timeoutMs: remaining });
    const page = await client.eval("return figma.currentPage.name");
    return { pid: child.pid, port, page };
  } catch (e) {
    throw new Error(
      `Debug Figma launched on port ${port} but the Plugin API did not become ready: ${e.message}. ` +
        "Make sure a design file (not the recents/home page) is open, then retry.",
    );
  } finally {
    client?.close();
  }
}

/** Quit the debug Figma. */
export async function stop() {
  return quitFigma();
}

/** Remove the cloned debug app (does not touch the installed Figma). */
export function clean() {
  if (existsSync(DEBUG_APP)) rmSync(DEBUG_APP, { recursive: true, force: true });
}
