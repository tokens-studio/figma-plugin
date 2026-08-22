# figma-bridge — agent instructions

Instructions for an AI agent (or a human) operating this tool. This file is
**self-contained**: it travels with the `figma-bridge/` folder, so everything an
agent needs to use the bridge lives here and in the sibling docs — not in any
repo-level instructions file.

## What this is / when to reach for it

A zero-dependency tool that lets you drive the **local Figma Desktop** over the
Chrome DevTools Protocol (CDP) and evaluate **Plugin-API** JS (`figma.*`) directly
in the renderer — **no plugin, no UI clicks, no per-session setup**. Use it to close
a **build → run → verify** loop against real Figma autonomously: read the document,
mutate nodes, manage variables/styles, export a node to a PNG, screenshot the canvas.

- **Platform:** macOS only, for now. **Runtime:** Node 22+ (built-in `WebSocket`/`fetch` globals). **Zero npm deps.**
- Steady state: always launch via `node cli.mjs start` (it clones/patches/signs once, then reuses).

## Yes, you can drive a plugin's own UI

The bridge is not limited to the raw Plugin API. **A Figma plugin's own UI is
fully drivable** — launch the plugin, navigate its tabs, open its modals, fill its
forms, click through its dialogs, and read its app state, all without a human.
(Done end-to-end against the Tokens Studio plugin's React UI.) Don't conclude
you're stuck at `figma.*`.

Two facts decide whether this works for you:

1. **The plugin UI is a separate execution context in the same CDP target** —
   not a separate target. `client._contexts` lists them all; the plugin one has a
   `data:text/html;base64,…` `location.href`, the document one has `figma`. `eval`
   and every `cli.mjs` command talk to the *document* context only.
2. **`Input.dispatchMouseEvent` coordinates are top-level-page coordinates**, while
   rects measured inside the plugin iframe are iframe-relative. **Add the iframe's
   offset** or your clicks land on the canvas and silently do nothing.

Full recipes — finding the context, the offset, `realClick`/`evalIn` helpers,
typing, launching a plugin via Cmd+P, reading `window.store.getState()` — are in
[AGENT-GUIDE.md → Driving a plugin's UI](./docs/AGENT-GUIDE.md#driving-a-plugins-ui).

**What still needs a human:** importing a plugin manifest the first time
(*Plugins → Development → Import plugin from manifest…* opens a macOS
`NSOpenPanel`, which CDP cannot touch) and re-pointing an existing registration at
a different path. Everything after that registration is automatable.

## Start here

1. **[README.md](./README.md)** — what it is, why it works, full command reference, setup.
2. **[docs/BEST-PRACTICES.md](./docs/BEST-PRACTICES.md)** — how to operate it well. Read
   **the verification hierarchy** first; it's the single most important habit.
3. **[docs/AGENT-GUIDE.md](./docs/AGENT-GUIDE.md)** — copy-paste recipes for read / create /
   verify, and for **driving a plugin's own UI**.

## Commands

From `tools/figma-bridge/`:

```bash
node cli.mjs <status | start | stop | eval "<js>" | export <nodeId> [file] [scale] | shot [file] | prepare | clean>
```

JSON on stdout; `{"error": ...}` + exit 1 on failure.

## The one rule that matters most: the verification hierarchy

Pick the cheapest check that actually answers your question; reach for a screenshot
last. (Full version in [BEST-PRACTICES.md](./docs/BEST-PRACTICES.md#the-verification-hierarchy).)

1. **Read the value with `eval`** (the Figma **Plugin API**, in-process over the bridge —
   _not_ the REST API). For any _"what is this?"_ — color, name, size, bound variable,
   font, node tree — read it, never eyeball it. Structured data is assertable. This
   extends to a **plugin's** own state: read `document.body.innerText` or the app's
   store from the plugin context instead of screenshotting its UI.
2. **`export <nodeId>` → PNG** to validate _a frame you drew_. `node.exportAsync` gives
   just that node's pixels, tight-cropped, full fidelity, zoom/panel-independent.
3. **`shot` (whole-window screenshot)** _only_ for Figma's own chrome (panels, native
   menus/dialogs) or values nothing else can expose. A full-window shot to check a
   frame's content — or a plugin's UI, which you can read directly — is almost always
   the wrong call.

## Key facts & gotchas (learned building it)

- **How it works**: clone `/Applications/Figma.app` → `~/.figma-bridge/FigmaDebug.app`
  (`ditto`, APFS clone), byte-flip the copy's `app.asar`
  (`removeSwitch("remote-debugging-port")` → `...debugXing...`, same length so the asar
  stays valid), ad-hoc `codesign --sign -`, launch the binary with
  `--remote-debugging-port=9222`. Patching a **copy** needs no macOS "App Management"
  permission; patching the installed app does.
- **`figma` is reachable over CDP with NO plugin** (v126) — but only in a specific
  renderer execution context, and only when a **design file** (URL
  `figma.com/(design|file)/`) is open (not the recents/home page). Scan all matching
  targets for the context where `typeof figma !== "undefined"`; suspended restored tabs
  won't have it.
- **`export` impl**: `node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: N } })`
  → `figma.base64Encode(bytes)` (a string — transports cleanly over CDP; avoids
  Uint8Array→JSON bloat and `btoa` stack limits) → `Buffer.from(b64, "base64")` in Node.
  Guard `typeof node.exportAsync === "function"` (FrameNode/PageNode are exportable).
- **Auto-layout hug/wrap gotcha** (hit + fixed for real): a VERTICAL frame that should
  grow with children needs `primaryAxisSizingMode="AUTO"` or it stays at its initial
  height and clips (the "content squished to 10px" symptom). A HORIZONTAL **wrap** row
  needs `layoutWrap="WRAP"` + `primaryAxisSizingMode="FIXED"` (fixed width forces
  wrapping) + `counterAxisSizingMode="AUTO"` (height hugs rows); `itemSpacing` = column
  gap, `counterAxisSpacing` = row gap. When a layout looks collapsed, read the sizing
  modes with `eval` rather than guessing from a screenshot.
- **Mutations are real & cloud-synced** — `eval` edits the user's actual logged-in
  Figma; there's no sandbox. Work on a scratch file/page, prefer additive changes, write
  idempotent scripts (find-by-name before create), and never delete user content unasked.
- **UI state does not survive between script invocations** — menus and flyouts close,
  plugin dialogs reset. Do a whole interaction (open → navigate → click → assert) in
  **one continuous script**, with retries/polling inside it. Splitting it across runs
  is the biggest time sink when driving UI.
- **Verify _which build_ of a dev plugin is running.** Figma keys development plugins
  on the manifest **`id`** and keeps the path it was first registered from — so a
  worktree can silently run the main repo's months-old build. Prove it's your build
  (unique marker → rebuild → relaunch → confirm) before trusting any behaviour. Also
  check for `Failed to load .env.` at build time: env-dependent features then fail
  *silently at runtime*, and `.env` is gitignored so fresh worktrees lack it.
- **The debug build crashes, especially on keyboard events.** Avoid
  `Input.dispatchKeyEvent` **with modifiers** (Cmd+A repeatedly hard-crashed Figma).
  After any CDP timeout, run `node cli.mjs status` — `running: false` is the tell —
  then `node cli.mjs start` and re-run.
- **Target a specific file** among many tabs by filtering on its **file key**:
  `connect({ targetUrl: "<key>" })` in an inline `node -e` script (the CLI itself doesn't
  expose targetUrl; it picks the first live design context). See
  [AGENT-GUIDE.md](./docs/AGENT-GUIDE.md#targeting-a-specific-file).
- **Cold-start timing**: the CDP port opens several seconds _before_ the renderer injects
  `figma`. Don't trust port-ready alone — poll until `figma` actually evaluates. `start`
  already does this.
- **One instance at a time**: installed app + debug copy share the login profile /
  single-instance lock, so `start` gracefully quits any running Figma first
  (`osascript ... quit`; Figma cloud-syncs, no dialog).
- **CDP can't eval bare top-level `return`** — wrap snippets with `return`/`await` in
  `(async () => { ... })()` (cli.mjs does this for you). Return JSON-serializable values
  (node objects carry methods that won't serialize).
- **Out of the workspace graph**: this tool lives under `tools/`, outside the `apps/*`
  and `packages/*` workspaces, so it's not in the turbo build/lint/test graph. Keep it
  zero-dep and standalone. Runtime state + the ~300 MB app copy live in
  `~/.figma-bridge/`, never committed.
