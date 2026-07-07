# figma-bridge

Programmatic control of your local **Figma Desktop** from bash — no plugin, no UI
clicks, no per-session setup. It drives Figma over the Chrome DevTools Protocol (CDP)
and evaluates **Plugin-API** JavaScript (`figma.*`) directly in the renderer, so an
agent (or you) can read the document, mutate nodes, manage variables, export any node
to a PNG, and screenshot the canvas entirely from the command line.

> **Platform:** macOS only, for now. **Runtime:** Node 22+ (uses the built-in global
> `WebSocket`/`fetch`; `WebSocket` is a stable global from Node 22). **Zero npm dependencies.**

## Why this exists

Figma deliberately strips the `--remote-debugging-port` flag at launch, and its plugin
sandbox can't be imported/run without a human clicking through the UI. This tool works
around the first restriction with a one-byte patch to a **copy** of Figma.app and skips
the plugin sandbox entirely — the agent talks to the real `figma` global over CDP.

## How it works

1. **Clone** `/Applications/Figma.app` → `~/.figma-bridge/FigmaDebug.app` (fast APFS
   clone via `ditto`, ~300 MB, done once).
2. **Patch** the copy's `app.asar`: Figma calls `removeSwitch("remote-debugging-port")`
   to drop the debug flag; we flip one byte → `removeSwitch("remote-debugXing-port")`,
   turning that call into a no-op. Same length, so the asar stays valid. We patch the
   **copy**, so no macOS "App Management" permission is needed.
3. **Ad-hoc re-sign** the copy (`codesign --sign -`) so macOS will launch the modified
   bundle, then launch its binary directly with `--remote-debugging-port=9222`.
4. **Connect** over CDP: find the target whose URL matches `figma.com/(design|file)/`,
   locate the execution context exposing the `figma` global, and `Runtime.evaluate`
   Plugin-API JS there. Screenshots use `Page.captureScreenshot`.

All generated state (the app copy, logs, target cache) lives in `~/.figma-bridge/` —
**nothing large is committed to the repo.** Only the code lives here.

## Usage

From `tools/figma-bridge/`:

```bash
node cli.mjs start                 # clone/patch/sign (once) + launch debug Figma, wait until ready
node cli.mjs status                # is a debug Figma up? which file/page is open?
node cli.mjs eval "return figma.currentPage.name"
node cli.mjs eval "return (await figma.variables.getLocalVariableCollectionsAsync()).map(c => c.name)"
node cli.mjs export "12:34" frame.png    # export ONE node's pixels (tight crop) — verify a frame
node cli.mjs shot canvas.png       # screenshot the WHOLE Figma window (UI chrome)
node cli.mjs stop                  # quit the debug Figma
node cli.mjs prepare               # clone/patch/sign WITHOUT launching
node cli.mjs clean                 # delete the cloned debug app (installed Figma untouched)
```

Every command prints JSON to stdout. On failure it prints `{"error": "..."}` to stderr
and exits non-zero, so it's easy to script and check.

### `export` vs `shot` — validating your work

Two very different screenshots, and picking the right one matters:

- **`export <nodeId> [file] [scale]`** calls `node.exportAsync()` and returns **just that
  node's pixels** — tightly cropped, full fidelity, independent of zoom/viewport/panels.
  This is the right way to **validate a frame you built**. Default scale is `2` (@2x).
- **`shot [file]`** captures the **entire Figma window** (toolbar, panels, canvas chrome)
  at the current zoom. Reserve it for when the thing you need to see *is Figma's own UI* —
  a plugin's iframe, the inspector/variables panels, etc.

And when the question is *"what is this value?"* (a color, a name, a bound variable), don't
screenshot at all — **read it with `eval`**. See
[docs/BEST-PRACTICES.md](./docs/BEST-PRACTICES.md#the-verification-hierarchy) for the full
verification hierarchy.

### Writing `eval` snippets

- A **bare expression** is evaluated as-is: `figma.currentPage.name`.
- A snippet containing `return` or `await` is auto-wrapped in an async IIFE, so you can
  write multiple statements and await Plugin-API promises:
  ```bash
  node cli.mjs eval "const r = figma.createRectangle(); r.name='x'; return r.id"
  ```
- **Return JSON-serializable values.** Figma node objects have methods and won't
  serialize — return primitives/plain objects (ids, names, counts, arrays).

### Environment

- `FIGMA_BRIDGE_PORT` — override the debug port (default `9222`).

## Important caveats

- **`start` quits any running Figma first.** The installed app and the debug copy share
  one logged-in profile and Figma's single-instance lock, so only one can run at a time.
  The quit is graceful (`osascript ... quit`) — Figma cloud-syncs and normally closes
  without a dialog. In steady state, just always launch Figma via `node cli.mjs start`.
- **A design *file* must be open** (not the recents/home page) for the Plugin API to be
  reachable — that's where the `figma` global lives. `start` waits until a document's
  `figma` is actually evaluable before returning; restored/suspended background tabs are
  scanned and skipped automatically.
- The debug copy is **ad-hoc signed**. That's fine for launching locally; it is not
  distributable.

## Fallback: patch the installed app (variant B)

If the copied-app route ever fails on your machine (e.g. Gatekeeper refuses the ad-hoc
copy), you can patch the installed app in place instead:

1. **System Settings → Privacy & Security → App Management** → enable it for your
   terminal app. (Required to modify `/Applications/Figma.app`.)
2. Back up and patch the installed asar (same one-byte flip):
   ```bash
   cp /Applications/Figma.app/Contents/Resources/app.asar ~/figma-app.asar.bak
   # flip removeSwitch("remote-debugging-port") -> removeSwitch("remote-debugXing-port")
   ```
   You can reuse this tool's patch logic by pointing it at the installed asar, or apply
   the byte edit manually.
3. Re-sign and relaunch with `--remote-debugging-port=9222`. The CDP path afterward is
   identical.

To undo: restore `~/figma-app.asar.bak` (or re-run Figma's updater, which replaces the
asar).

## Cleanup

```bash
node cli.mjs stop      # quit the debug Figma
node cli.mjs clean     # remove ~/.figma-bridge/FigmaDebug.app
```

`clean` never touches your installed `/Applications/Figma.app`.

## Files

- `cdp.mjs` — zero-dep CDP client: target + `figma`-context discovery (with retry for
  cold loads), `eval`, `exportNode` (per-node PNG), `screenshot` (whole window).
- `launch.mjs` — lifecycle: clone, patch/unpatch (byte-flip), ad-hoc sign, start (quit
  running Figma → launch → wait for Plugin-API readiness), stop, clean.
- `cli.mjs` — the bash-callable command surface.

This tool lives under `tools/` and is intentionally **outside** the npm workspaces
(`apps/*`, `packages/*`), so it's not part of the turbo build/lint/test graph.

## Docs

- **[AGENTS.md](./AGENTS.md)** — start here if you're an AI agent (or automating this):
  what it is, when to reach for it, the verification hierarchy in brief, and the key
  gotchas. Self-contained so it travels with the folder.
- **[docs/BEST-PRACTICES.md](./docs/BEST-PRACTICES.md)** — how to operate the bridge well.
  Start with the verification hierarchy (read with `eval` → `export` a node → `shot` the
  window), plus notes on idempotency, real/cloud-synced mutations, and file targeting.
- **[docs/AGENT-GUIDE.md](./docs/AGENT-GUIDE.md)** — copy-paste recipes for the
  build → run → verify loop: reading variables/styles, creating frames and text, the
  auto-layout hug/wrap gotcha, exporting to verify, and targeting a specific file.
