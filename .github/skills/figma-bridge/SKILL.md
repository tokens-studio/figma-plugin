---
name: figma-bridge
description: Drive the local Figma Desktop from bash over the Chrome DevTools Protocol to eval Plugin-API JS (figma.*), export nodes to PNG, and screenshot the window. Use this skill when developing the Figma plugin in this repo to close a build→run→verify loop against real Figma with no plugin sandbox and no UI clicks.
---

# Figma Bridge

`tools/figma-bridge/` is a zero-dependency tool that drives your **local Figma
Desktop** over the Chrome DevTools Protocol (CDP) and evaluates **Plugin-API**
JavaScript (`figma.*`) directly in the renderer. It lets an agent close a
**build → run → verify** loop against real Figma from bash — read the document,
mutate nodes, manage variables/styles, export a node to a PNG, screenshot the
window — **no plugin sandbox, no UI clicks, no per-session setup.**

> This SKILL is a thin entry point. The bridge's own docs are canonical and
> self-contained — they travel with the folder. **Read them for depth:**
> [`README.md`](../../../tools/figma-bridge/README.md) ·
> [`AGENTS.md`](../../../tools/figma-bridge/AGENTS.md) ·
> [`docs/BEST-PRACTICES.md`](../../../tools/figma-bridge/docs/BEST-PRACTICES.md) ·
> [`docs/AGENT-GUIDE.md`](../../../tools/figma-bridge/docs/AGENT-GUIDE.md)

## When to Use This Skill

Use it when working on the Figma plugin in this repo and you need to:

- Close a **build → run → verify** loop while developing the plugin
- Read or mutate variables, styles, and nodes in a live Figma document
- Verify a frame you built by exporting just that node's pixels
- Validate changes against the real Figma runtime instead of only relying on mocks

## Prerequisites

- **macOS only** (for now)
- **Node 22+** (uses built-in `WebSocket`/`fetch` globals)
- **Zero npm dependencies** — nothing to install
- Figma Desktop installed at `/Applications/Figma.app`
- A design **file** open in Figma (not the recents/home page) — that's where the
  `figma` global lives

## Quick Start

Run all commands from `tools/figma-bridge/`:

```bash
cd tools/figma-bridge

node cli.mjs start                 # clone/patch/sign (once) + launch debug Figma, wait until ready
node cli.mjs status                # is a debug Figma up? which file/page is open?
node cli.mjs eval "return figma.currentPage.name"
node cli.mjs export "12:34" frame.png [scale]   # export ONE node's pixels (tight crop) — verify a frame
node cli.mjs shot canvas.png       # screenshot the WHOLE Figma window (UI chrome)
node cli.mjs stop                  # quit the debug Figma
node cli.mjs prepare               # clone/patch/sign WITHOUT launching
node cli.mjs clean                 # delete the cloned debug app (installed Figma untouched)
```

Notes:

- **Every command prints JSON to stdout.** When a command *fails* it prints
  `{"error": "..."}` to stderr and exits `1`, so it's easy to script and check.
  (An unknown or missing command is the one exception: it prints a `usage:` line
  to stderr and exits `2`.)
- **`start` quits any running Figma first** — the installed app and the debug copy
  share one login profile and Figma's single-instance lock, so only one runs at a
  time. The quit is graceful (Figma cloud-syncs). In steady state, always launch
  Figma via `node cli.mjs start`.
- **`start` waits for Plugin-API readiness** — a design file must be open, and it
  polls until a document's `figma` global is actually evaluable before returning.
- `eval` auto-wraps snippets using top-level `return`/`await` in an async IIFE.
  Always return **JSON-serializable** values (node objects carry methods and won't
  serialize).
- `FIGMA_BRIDGE_PORT` overrides the debug port (default `9222`).

## The One Habit That Matters: the Verification Hierarchy

Pick the cheapest check that actually answers your question; reach for a screenshot
**last**. (Full version in
[`docs/BEST-PRACTICES.md`](../../../tools/figma-bridge/docs/BEST-PRACTICES.md#the-verification-hierarchy).)

1. **Read the value with `eval`** (the Figma **Plugin API**, in-process over the
   bridge — *not* the REST API). For any *"what is this?"* — color, name, size,
   bound variable, font, node tree — read it, never eyeball it. Structured data is
   assertable.
2. **`export <nodeId>` → PNG** to validate *a frame you drew*. `node.exportAsync`
   gives just that node's pixels, tightly cropped, at full fidelity, independent of
   zoom/viewport/panels. Default scale is `2` (@2x).
3. **`shot` the whole window** *only* for Figma's own UI (a plugin's iframe/panels)
   or values the API genuinely can't expose. A full-window shot to check a frame's
   content is almost always the wrong call.

## Key Gotchas

- **A design *file* must be open** (not the recents/home page) for the Plugin API
  to be reachable.
- **Mutations are real and cloud-synced — there is no sandbox.** `eval` edits the
  user's actual logged-in Figma. So: work on a **scratch file/page**, write
  **idempotent** scripts (find-by-name before create), prefer additive changes, and
  **never delete user content unasked**.
- **One instance at a time.** `start` gracefully quits any running Figma before
  launching the debug copy.
- **Cold-start timing.** The CDP port opens several seconds *before* the renderer
  injects `figma` — don't trust port-ready alone; poll until `figma` actually
  evaluates. `start` already does this for you.

## Repo Context

- The bridge lives at `tools/figma-bridge/` and is intentionally outside the Yarn
  workspace graph, so it stays zero-dependency and standalone.
- Use it alongside normal repo workflows like `yarn start`, `yarn build`, or the
  plugin package commands when you need to validate a change inside real Figma.
- Prefer the bridge when mocks or unit tests are not enough and the question is
  specifically about Figma runtime behavior, variables, nodes, styles, or rendered output.
