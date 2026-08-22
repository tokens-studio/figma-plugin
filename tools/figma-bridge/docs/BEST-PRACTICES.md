# Figma bridge — best practices

Hard-won rules for driving Figma over the CDP bridge well. If you only read one
thing, read **[The verification hierarchy](#the-verification-hierarchy)** — it is
the single most important habit and the reason this tool has an `export` command.

> These are guidelines for an **agent** operating the bridge from bash, but they
> apply equally to a human at the keyboard. The bridge itself is documented in the
> [README](../README.md); the copy-paste recipes live in the
> [Agent guide](./AGENT-GUIDE.md).

---

## The verification hierarchy

You have three ways to "check" something in Figma. They are **not**
interchangeable — pick the cheapest one that actually answers your question,
and reach for a screenshot last.

### 1. Read the value with the Plugin API — _always try this first_

If the question is _"what is this?"_ — a color, a name, a size, a bound variable,
a font, the node tree — **read it**, don't look at it. `eval` runs real Plugin-API
JS in the live renderer and returns structured data you can assert on.

```bash
node cli.mjs eval 'return figma.currentPage.selection.map(n => ({ name: n.name, type: n.type, w: n.width, h: n.height }))'
```

Values you should read, never eyeball:

- fills / strokes and whether they are `(bound)` to a variable
- variable values, collections, modes, aliases
- text content, font family/style, font size
- layout props (`layoutMode`, sizing modes, padding, spacing)
- the node hierarchy and node ids

This is what the user means by _"the API-based way"_ — the **Figma Plugin API**,
in-process over the bridge. (Not the Figma REST API — that's a different, external
HTTP service and not what this tool uses.)

### 2. `export` a node — _to validate something you drew_

When the question is visual — _"does the frame I just built actually look right?"_
— export **just that node** to a PNG and view it:

```bash
node cli.mjs export "286:3" /tmp/frame.png   # nodeId, output path, optional scale (default 2)
```

`export` calls `node.exportAsync()`, so you get **exactly that node's pixels,
tightly cropped, at full fidelity, independent of the current zoom, viewport, or
which panels are open**. No toolbar, no sidebars, no canvas chrome. This is the
right tool for _"validate what's on a frame"_ and it should be your default for
visual checks.

### 3. `shot` the whole window — _only for Figma's own chrome_

`shot` captures the **entire Figma window as pixels** — toolbar, panels, canvas
chrome, at the current zoom. Reserve it for the few cases where the thing you need
to see _is_ Figma itself:

- the state of the variables / inspector / layers panels
- native menus and dialogs you can't reach any other way
- something the Plugin API genuinely can't expose

```bash
node cli.mjs shot /tmp/figma-window.png
```

**Rule of thumb:** validating _content_ → `export` the node. Inspecting _Figma_ →
`shot`. Answering _"what is the value"_ → don't screenshot at all, `eval` and read
it. A full-window screenshot to check a frame's colors is almost always the wrong
call — it's zoom-dependent, cluttered, and lower fidelity than an `export`.

### The hierarchy applies inside plugin UIs too

It's tempting to treat a plugin's own UI as a reason to `shot` the window. **It
isn't one.** The plugin UI is a real DOM in a separate execution context of the
same CDP target, so you can read it directly — which puts it right back at level 1:

- _"which tab / modal is showing, is there an error banner?"_ →
  `document.body.innerText` from the plugin context. Fast, cheap, greppable.
- _"is the app's state actually what I think?"_ → read the store, e.g.
  `window.store.getState()` for a Redux app, and assert on real values.

Reading state is the strongest habit available when debugging a plugin: it's how
you compare what the plugin *believes* against what actually got written
somewhere else. Pixels can't do that. Recipes are in
[Driving a plugin's UI](./AGENT-GUIDE.md#driving-a-plugins-ui).

---

## Other practices

### Prefer Plugin-API reads over pixels, everywhere

Beyond validation: whenever you're gathering information to make a decision
(what variables exist, what a token resolves to, whether text fits), read it with
`eval`. Structured data is assertable, diffable, and doesn't lie about anti-aliased
edges. Screenshots are for humans and for genuinely visual questions.

### Mutations are real and sync to the cloud

`eval` runs against the user's actual, logged-in Figma. Anything you create,
rename, restyle, or **delete is a real edit** on a real document and will sync.
There is no sandbox. So:

- Work on a scratch page/file when experimenting (the demo used a dedicated
  "Test CDP" file).
- Prefer additive changes; think twice before `.remove()`.
- Never delete or restructure the user's content without being asked.

### Write idempotent scripts

Assume your script may run more than once (you'll re-run to fix a bug). Before
creating a page/frame/style, look for an existing one by name and reuse or clear
it, so re-runs don't pile up duplicates.

```js
let page = figma.root.children.find((p) => p.name === "My scratch page");
if (!page) {
  page = figma.createPage();
  page.name = "My scratch page";
}
```

### Do a whole UI interaction in ONE script run

**UI state does not survive between invocations.** Figma's menus and flyouts
close, and plugin dialogs close or reset, between separate `node script.mjs`
runs. So open the menu, navigate it, click, and assert **inside one continuous
script** — and build the retries and polling *into* that script rather than
re-running it to get one step further.

Splitting an interaction across invocations is the single biggest source of
wasted time when driving UI over this bridge. It also produces very convincing
wrong conclusions ("the menu item isn't there") when the real cause is that the
menu closed when the previous process exited.

### Verify _which build_ is actually loaded

Figma identifies a development plugin by its manifest **`id`**, and it keeps the
**path it was originally registered from**. If the same `id` is registered from
another checkout — the main repo vs. a git worktree, say — Figma keeps running
that *other* copy. You can spend hours testing a months-old build from a
different branch while believing you're testing your working tree.

Before drawing any conclusion from plugin behaviour, **prove the running plugin
is your build**: temporarily add a unique marker to the source, rebuild,
relaunch, and confirm the marker appears. Check the displayed version too, if the
plugin has one. Re-pointing a registration at a different path is a **human**
step — they must re-import the manifest.

Related trap: a build that printed `Failed to load .env.` produces a bundle where
env-dependent features fail *silently at runtime*. In one case that disabled
license validation, which took a whole paid code path down with it and made
pushes fail for reasons that looked like a product bug. `.env` is gitignored, so
a **fresh worktree won't have one** — copy it from another checkout of the same
repo before concluding a feature is broken.

### Instrument with a global, not console capture

Capturing `Runtime.consoleAPICalled` is unreliable across plugin iframe reloads:
the listener is attached to a context that gets replaced, and the logs are
silently lost. Have the instrumented source push into a global instead, and read
it back with an eval afterwards — it survives reloads and gives decisive evidence.

```js
((globalThis).__debug = (globalThis).__debug || []).push({ where: "push", ok, at: Date.now() });
```

### Expect the debug build to crash, and make re-runs cheap

The patched debug Figma is noticeably crash-prone, especially around keyboard
events — **avoid `Input.dispatchKeyEvent` with modifiers** (Cmd+A and friends
repeatedly hard-crashed it). After any CDP timeout, and particularly
`CDP Input.dispatchKeyEvent timed out`, don't debug the script: check whether
Figma is still alive.

```bash
node cli.mjs status     # running: false right after a failure is the tell
node cli.mjs start      # relaunch and re-run
```

Write scripts so that a restart-and-rerun costs nothing — idempotent, no manual
setup steps in between.

### Target a specific file by key when many tabs are open

The CLI connects to whichever live design context it finds first, which may be the
wrong tab. To pin a specific document, filter targets by its **file key** (unique),
using the `connect({ targetUrl })` option from `cdp.mjs` in a small inline script —
see the [Agent guide](./AGENT-GUIDE.md#targeting-a-specific-file).

### Load fonts before touching text

`createText`, setting `.characters`, or changing font size throws if the font isn't
loaded. `await figma.loadFontAsync(...)` first. See the recipe in the Agent guide.

### Clean up temp artifacts

Screenshots and exports are throwaway. Write them to `/tmp` (or the bridge dir) and
delete them when you're done validating; don't leave PNGs in the repo.

### Keep the tool zero-dep and out of the workspace graph

`tools/figma-bridge/` is intentionally outside the npm/turbo workspaces and has no
dependencies (Node built-ins only). Keep it that way — it must run standalone. The
cloned 300 MB debug app and all runtime state live in `~/.figma-bridge/` and are
never committed.
